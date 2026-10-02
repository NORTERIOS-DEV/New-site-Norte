import type { Editor } from '@tiptap/core'

/** Compartilhado entre a toolbar fixa e o BubbleMenu - mesmo fluxo de inserir/remover link. */
export function promptForLink(editor: Editor) {
  const anterior = editor.getAttributes('link').href as string | undefined
  const url = window.prompt('URL do link:', anterior ?? 'https://')
  if (url === null) return
  if (url === '') {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}
