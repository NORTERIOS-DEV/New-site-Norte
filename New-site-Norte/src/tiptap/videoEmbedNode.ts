import { Node, mergeAttributes } from '@tiptap/core'
import { embedUrlFor, parseVideoUrl, type VideoProvider } from './videoUrl'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoEmbed: {
      /** Detecta o provedor (YouTube/Vimeo) a partir da URL e insere o node. Retorna false se a URL não for reconhecida. */
      setVideoEmbed: (url: string) => ReturnType
    }
  }
}

/** Node único cobrindo YouTube e Vimeo por URL colada - o TipTap não tem uma
 * extensão oficial para Vimeo, então em vez de misturar a extensão oficial
 * do YouTube com algo à parte, os dois passam pelo mesmo node.
 *
 * Esta é a versão BASE (attrs/parseHTML/renderHTML/comandos), sem NodeView
 * React - é o que o site público usa via generateHTML (renderExtensions.ts).
 * O editor do painel usa a versão estendida em videoEmbedNodeEditor.ts, que
 * adiciona addNodeView() por cima desta. Não importar @tiptap/react aqui:
 * isso vazaria pro bundle do site público, que nunca roda o editor. */
export const VideoEmbed = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      provider: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-provider'),
        renderHTML: (attrs) => (attrs.provider ? { 'data-provider': attrs.provider } : {}),
      },
      videoId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-video-id'),
        renderHTML: (attrs) => (attrs.videoId ? { 'data-video-id': attrs.videoId } : {}),
      },
      url: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-url'),
        renderHTML: (attrs) => (attrs.url ? { 'data-url': attrs.url } : {}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-video-embed]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const provider = HTMLAttributes['data-provider'] as VideoProvider | undefined
    const videoId = HTMLAttributes['data-video-id'] as string | undefined
    const wrapperAttrs = mergeAttributes(HTMLAttributes, { 'data-video-embed': '', class: 'video-embed' })

    if (!provider || !videoId) {
      return ['div', wrapperAttrs]
    }

    return [
      'div',
      wrapperAttrs,
      [
        'iframe',
        {
          src: embedUrlFor(provider, videoId),
          loading: 'lazy',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowfullscreen: 'true',
          frameborder: '0',
        },
      ],
    ]
  },

  addCommands() {
    return {
      setVideoEmbed:
        (url: string) =>
        ({ commands }) => {
          const parsed = parseVideoUrl(url)
          if (!parsed) return false
          return commands.insertContent({
            type: this.name,
            attrs: { provider: parsed.provider, videoId: parsed.videoId, url },
          })
        },
    }
  },
})
