import { useEditor, EditorContent, type JSONContent } from '@tiptap/react'
import { useEffect } from 'react'
import { tiptapExtensions } from '../../tiptap/extensions'
import { TipTapToolbar } from './TipTapToolbar'
import '../../styles/tiptap.css'

type TipTapEditorProps = {
  content: JSONContent | null
  onChange: (content: JSONContent) => void
}

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: tiptapExtensions,
    content: content ?? '',
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  })

  // Sincroniza quando o conteúdo muda de fora depois do editor já montado
  // (ex.: post legado convertido de HTML pra JSON de forma assíncrona). O
  // compare por JSON evita reaplicar o próprio conteúdo a cada keystroke.
  useEffect(() => {
    if (!editor || !content || editor.isDestroyed) return
    const atual = JSON.stringify(editor.getJSON())
    const novo = JSON.stringify(content)
    if (atual !== novo) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  return (
    <div className="tiptap-editor">
      <TipTapToolbar editor={editor} />
      <EditorContent editor={editor} className="tiptap-content" />
    </div>
  )
}
