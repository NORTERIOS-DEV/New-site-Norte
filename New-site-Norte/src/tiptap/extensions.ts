import StarterKit from '@tiptap/starter-kit'
import { TextStyle, FontFamily, Color, FontSize } from '@tiptap/extension-text-style'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { VideoEmbedEditor } from './videoEmbedNodeEditor'

/**
 * Extensões do editor interativo (TipTapEditor.tsx, só usado no painel,
 * lazy-loaded). Para a conversão JSON→HTML no site público, use
 * renderExtensions.ts - mesmo schema (mesmo nome/attrs/renderHTML por node),
 * mas sem NodeView React, pra não vazar @tiptap/react pro bundle público.
 *
 * StarterKit do TipTap v3 já inclui underline, link, blockquote, listas,
 * heading, horizontalRule (separador) e hardBreak (quebra de linha) - não
 * precisa registrar essas extensões separadamente (duplicar o nome quebra
 * em runtime).
 *
 * Heading disponível em H1/H2/H3 (H4 fica de fora, sem pedido pra isso).
 */
export const tiptapExtensions = [
  TextStyle, FontFamily, Color, FontSize,
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    link: { openOnClick: false, autolink: true },
  }),
  Image,
  TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
  Placeholder.configure({ placeholder: 'Escreva o conteúdo da postagem…' }),
  CharacterCount,
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  VideoEmbedEditor,
]
