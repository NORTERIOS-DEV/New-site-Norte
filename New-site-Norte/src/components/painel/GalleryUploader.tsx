import { useRef, useState, type ChangeEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadFotos, type UploadFotosResult } from '../../services/painel/galeriaApi'

type GalleryUploaderProps = {
  albumId: number
}

export function GalleryUploader({ albumId }: GalleryUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const [resultado, setResultado] = useState<UploadFotosResult | null>(null)

  const enviar = useMutation({
    mutationFn: (files: File[]) => uploadFotos(albumId, files),
    onSuccess: (data) => {
      setResultado(data)
      queryClient.invalidateQueries({ queryKey: ['painel', 'albuns', String(albumId)] })
    },
  })

  function onArquivosSelecionados(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length === 0) return
    setResultado(null)
    enviar.mutate(files)
  }

  return (
    <div className="painel-gallery-uploader">
      <button type="button" onClick={() => inputRef.current?.click()} disabled={enviar.isPending}>
        {enviar.isPending ? 'Enviando…' : 'Enviar fotos'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={onArquivosSelecionados} />
      {resultado && (
        <div className="painel-upload-result">
          {resultado.criadas.length > 0 && <p>{resultado.criadas.length} foto(s) adicionada(s).</p>}
          {resultado.erros.map((erro) => (
            <p key={erro.arquivo} className="painel-field-error">
              {erro.arquivo}: {erro.erro}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
