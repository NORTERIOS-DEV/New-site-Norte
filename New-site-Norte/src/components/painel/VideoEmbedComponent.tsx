import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { embedUrlFor, type VideoProvider } from '../../tiptap/videoUrl'

export function VideoEmbedComponent({ node, deleteNode, selected }: NodeViewProps) {
  const provider = node.attrs.provider as VideoProvider | null
  const videoId = node.attrs.videoId as string | null

  return (
    <NodeViewWrapper className={`video-embed-node${selected ? ' is-selected' : ''}`}>
      {provider && videoId ? (
        <div className="video-embed-frame">
          <iframe
            src={embedUrlFor(provider, videoId)}
            title="Vídeo incorporado"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            frameBorder={0}
          />
        </div>
      ) : (
        <div className="video-embed-frame video-embed-invalido">Link de vídeo inválido</div>
      )}
      <button type="button" className="video-embed-remove" contentEditable={false} onClick={() => deleteNode()}>
        Remover vídeo
      </button>
    </NodeViewWrapper>
  )
}
