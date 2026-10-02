import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent } from 'react'
import { IconUploadImage } from './icons'

type ImageDropInputProps = {
  file: File | null
  onFileChange: (file: File | null) => void
  existingImageUrl?: string | null
  label?: string
}

export function ImageDropInput({ file, onFileChange, existingImageUrl, label }: ImageDropInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Gera um object URL para o arquivo recém-selecionado/arrastado e revoga o
  // anterior no cleanup - evita vazamento de memória a cada troca de imagem.
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const previewSrc = previewUrl ?? existingImageUrl ?? null

  function abrirSeletor() {
    inputRef.current?.click()
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      abrirSeletor()
    }
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0] ?? null
    event.target.value = ''
    onFileChange(picked)
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragOver(true)
  }

  function onDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragOver(false)
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragOver(false)
    const dropped = event.dataTransfer.files?.[0]
    if (dropped && dropped.type.startsWith('image/')) {
      onFileChange(dropped)
    }
  }

  return (
    <div
      className={`painel-image-drop${isDragOver ? ' is-dragover' : ''}${previewSrc ? ' has-image' : ''}`}
      onClick={abrirSeletor}
      onKeyDown={onKeyDown}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
      data-tooltip="Clique ou arraste uma imagem"
    >
      {previewSrc ? (
        <img className="painel-image-drop-preview" src={previewSrc} alt="Pré-visualização da capa" />
      ) : (
        <div className="painel-image-drop-placeholder">
          <IconUploadImage />
          <span>{label ?? 'Arraste uma imagem ou clique para selecionar'}</span>
        </div>
      )}
      <span className="painel-sr-only">Selecionar imagem de capa</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        data-testid="painel-image-drop-input"
        onChange={onInputChange}
      />
    </div>
  )
}
