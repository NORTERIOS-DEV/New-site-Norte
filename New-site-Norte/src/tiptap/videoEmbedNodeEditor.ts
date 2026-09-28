import { ReactNodeViewRenderer } from '@tiptap/react'
import { VideoEmbedComponent } from '../components/painel/VideoEmbedComponent'
import { VideoEmbed } from './videoEmbedNode'

/** Só usado pelo editor do painel (TipTapEditor.tsx) - adiciona a NodeView
 * React interativa por cima do node base. Mantido separado de
 * videoEmbedNode.ts para que o site público (SafeContent/renderExtensions)
 * nunca precise importar @tiptap/react. */
export const VideoEmbedEditor = VideoEmbed.extend({
  addNodeView() {
    return ReactNodeViewRenderer(VideoEmbedComponent)
  },
})
