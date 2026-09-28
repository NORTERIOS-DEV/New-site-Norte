import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import type { Foto } from '../data/galeriaTypes'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'
import 'yet-another-react-lightbox/plugins/counter.css'

export function GaleriaLightbox({
  fotos,
  index,
  onClose,
  onIndexChange,
}: {
  fotos: Foto[]
  index: number | null
  onClose: () => void
  onIndexChange: (index: number) => void
}) {
  return (
    <Lightbox
      open={index !== null}
      index={index ?? 0}
      close={onClose}
      on={{ view: ({ index: nextIndex }) => onIndexChange(nextIndex) }}
      plugins={[Captions, Counter]}
      carousel={{ preload: 2 }}
      animation={{ fade: 350, swipe: 400 }}
      slides={fotos.map((foto) => ({
        src: foto.imagem_media,
        alt: foto.alt,
        description: foto.legenda || undefined,
        width: foto.largura ?? undefined,
        height: foto.altura ?? undefined,
      }))}
    />
  )
}
