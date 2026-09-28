import DOMPurify from 'dompurify'
import { generateHTML } from '@tiptap/html'
import type { JSONContent } from '@tiptap/core'
import { tiptapRenderExtensions } from '../tiptap/renderExtensions'

// Origens de embed permitidas para o node de vídeo do editor (YouTube/Vimeo).
// DOMPurify por padrão remove <iframe>; ADD_TAGS abaixo reabilita só pra essa
// função, e este hook trava o src a essas origens - sem isso, ADD_TAGS+ADD_ATTR
// abriria a porta pra qualquer iframe arbitrário vindo do conteúdo salvo.
const IFRAME_ALLOWED_ORIGINS = ['https://www.youtube-nocookie.com/', 'https://player.vimeo.com/']

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName !== 'iframe') return
  const src = node instanceof Element ? node.getAttribute('src') ?? '' : ''
  const permitido = IFRAME_ALLOWED_ORIGINS.some((origem) => src.startsWith(origem))
  if (!permitido) {
    node.parentNode?.removeChild(node)
  }
})

const SANITIZE_CONFIG = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'loading', 'data-provider', 'data-video-embed'],
}

type SafeContentProps = {
  html: string
  json: JSONContent | null
  className?: string
}

/** Renderiza o conteúdo de um post: prioriza conteudo_json (TipTap) convertido
 * pra HTML via generateHTML, e cai pro HTML legado (CKEditor5) quando não há
 * JSON - garante que posts antigos continuam aparecendo normalmente mesmo
 * sem terem passado pelo editor novo ainda. */
export function SafeContent({ html, json, className }: SafeContentProps) {
  const renderedHtml = json ? generateHTML(json, tiptapRenderExtensions) : html
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderedHtml, SANITIZE_CONFIG) }}
    />
  )
}
