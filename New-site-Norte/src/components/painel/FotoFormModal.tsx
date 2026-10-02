import { useState, type FormEvent, type MouseEvent } from 'react'
import { ImageDropInput } from './ImageDropInput'

type FotoFormModalProps = {
  title: string
  existingImageUrl?: string | null
  initialLegenda?: string
  initialAlt?: string
  exigirImagem?: boolean
  isPending?: boolean
  error?: string | null
  onCancel: () => void
  onSubmit: (data: { file: File | null; legenda: string; alt: string }) => void
}

// Modal único usado tanto para cadastrar uma foto nova (GalleryUploader)
// quanto para editar uma já existente (SortablePhotoGrid) - em ambos os
// casos o formulário é o mesmo: imagem (via ImageDropInput), legenda e alt.
export function FotoFormModal({
  title,
  existingImageUrl = null,
  initialLegenda = '',
  initialAlt = '',
  exigirImagem = false,
  isPending = false,
  error = null,
  onCancel,
  onSubmit,
}: FotoFormModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [legenda, setLegenda] = useState(initialLegenda)
  const [alt, setAlt] = useState(initialAlt)
  const [erroValidacao, setErroValidacao] = useState<string | null>(null)

  function onSubmitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (exigirImagem && !file) {
      setErroValidacao('Selecione uma imagem.')
      return
    }
    setErroValidacao(null)
    onSubmit({ file, legenda, alt })
  }

  function pararPropagacao(event: MouseEvent) {
    event.stopPropagation()
  }

  return (
    <div className="painel-modal-backdrop" onClick={onCancel}>
      <form className="painel-modal" onClick={pararPropagacao} onSubmit={onSubmitForm}>
        <h2>{title}</h2>
        <ImageDropInput
          file={file}
          onFileChange={setFile}
          existingImageUrl={existingImageUrl}
          label="Arraste uma imagem ou clique para selecionar"
        />
        <label>
          Legenda
          <input value={legenda} onChange={(event) => setLegenda(event.target.value)} />
        </label>
        <label>
          Texto alternativo
          <input value={alt} onChange={(event) => setAlt(event.target.value)} />
        </label>
        {(erroValidacao || error) && <p className="painel-field-error">{erroValidacao ?? error}</p>}
        <div className="painel-modal-actions">
          <button type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" disabled={isPending}>
            {isPending ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
