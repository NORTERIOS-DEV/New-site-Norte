import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { VideoEmbed } from './videoEmbedNode'

/**
 * Extensões para o site público converter conteudo_json em HTML
 * (generateHTML, usado por SafeContent.tsx). Mesmo schema de extensions.ts
 * (mesmo nome/attrs/renderHTML por node, então o HTML gerado é idêntico),
 * mas deliberadamente sem @tiptap/react: generateHTML só usa renderHTML, não
 * NodeView, e sem Placeholder (só existe pra UX de edição, não afeta saída).
 * Isso mantém TipTap fora do bundle público - só entra quando alguém navega
 * pro /painel.
 */
export const tiptapRenderExtensions = [
  StarterKit.configure({
    // Mantém até H4 aqui (extensions.ts só permite criar H1-H3 na toolbar):
    // posts legados podem ter H4 persistido no conteudo_json, e o render
    // público precisa continuar reconhecendo esse nível mesmo sem a toolbar
    // mais oferecer criar um novo.
    heading: { levels: [1, 2, 3, 4] },
    link: { openOnClick: false, autolink: true },
  }),
  Image,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,
  VideoEmbed,
]
