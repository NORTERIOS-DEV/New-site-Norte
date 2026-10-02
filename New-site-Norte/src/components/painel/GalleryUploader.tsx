import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { uploadFotos } from '../../services/painel/galeriaApi'
import { FotoFormModal } from './FotoFormModal'
import { IconUploadImage } from './icons'

type GalleryUploaderProps = {
  albumId: number
}

export function GalleryUploader({ albumId }: GalleryUploaderProps) {
  const queryClient = useQueryClient()
  const [modalAberto, setModalAberto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const enviar = useMutation({
    mutationFn: (dados: { file: File; legenda: string; alt: string }) =>
      uploadFotos(albumId, [dados.file], { legenda: dados.legenda, alt: dados.alt }),
    onSuccess: (data) => {
      if (data.erros.length > 0) {
        setErro(data.erros[0].erro)
        return
      }
      queryClient.invalidateQueries({ queryKey: ['painel', 'albuns', String(albumId)] })
      toast.success('Foto adicionada com sucesso!')
      setModalAberto(false)
    },
    onError: () => setErro('Não foi possível enviar a foto.'),
  })

  function abrirModal() {
    setErro(null)
    setModalAberto(true)
  }

  function onSubmit({ file, legenda, alt }: { file: File | null; legenda: string; alt: string }) {
    if (!file) return
    setErro(null)
    enviar.mutate({ file, legenda, alt })
  }

  return (
    <div className="painel-gallery-uploader">
      <button type="button" className="painel-primary-button" onClick={abrirModal}>
        <IconUploadImage />
        Adicionar foto
      </button>

      {modalAberto &&
        createPortal(
          <FotoFormModal
            title="Adicionar foto"
            exigirImagem
            isPending={enviar.isPending}
            error={erro}
            onCancel={() => setModalAberto(false)}
            onSubmit={onSubmit}
          />,
          document.body,
        )}
    </div>
  )
}
