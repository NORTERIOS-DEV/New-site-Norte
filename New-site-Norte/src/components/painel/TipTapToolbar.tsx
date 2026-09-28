import type { Editor } from '@tiptap/core'
import { useCallback, useRef, type ChangeEvent } from 'react'
import { uploadImagem } from '../../services/painel/uploadsApi'

type TipTapToolbarProps = {
  editor: Editor | null
}

const HEADING_LEVELS = [1, 2, 3, 4] as const

export function TipTapToolbar({ editor }: TipTapToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const inserirImagem = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  async function onArquivoSelecionado(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !editor) return
    try {
      const url = await uploadImagem(file)
      editor.chain().focus().setImage({ src: url }).run()
    } catch {
      window.alert('Não foi possível enviar a imagem.')
    }
  }

  function inserirVideo() {
    if (!editor) return
    const url = window.prompt('Cole o link do vídeo (YouTube ou Vimeo):')
    if (!url) return
    const ok = editor.chain().focus().setVideoEmbed(url).run()
    if (!ok) window.alert('Link de vídeo não reconhecido. Use um link do YouTube ou do Vimeo.')
  }

  function inserirLink() {
    if (!editor) return
    const anterior = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL do link:', anterior ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  if (!editor) return null

  return (
    <div className="tiptap-toolbar">
      {HEADING_LEVELS.map((nivel) => (
        <button
          key={nivel}
          type="button"
          className={editor.isActive('heading', { level: nivel }) ? 'is-active' : ''}
          onClick={() => editor.chain().focus().toggleHeading({ level: nivel }).run()}
        >
          H{nivel}
        </button>
      ))}
      <button
        type="button"
        className={editor.isActive('paragraph') ? 'is-active' : ''}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        Texto
      </button>

      <span className="tiptap-separator" />

      <button
        type="button"
        className={editor.isActive('bold') ? 'is-active' : ''}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        Negrito
      </button>
      <button
        type="button"
        className={editor.isActive('italic') ? 'is-active' : ''}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        Itálico
      </button>
      <button
        type="button"
        className={editor.isActive('underline') ? 'is-active' : ''}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        Sublinhado
      </button>
      <button type="button" className={editor.isActive('link') ? 'is-active' : ''} onClick={inserirLink}>
        Link
      </button>

      <span className="tiptap-separator" />

      <button
        type="button"
        className={editor.isActive('bulletList') ? 'is-active' : ''}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        Lista
      </button>
      <button
        type="button"
        className={editor.isActive('orderedList') ? 'is-active' : ''}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        Lista numerada
      </button>
      <button
        type="button"
        className={editor.isActive('blockquote') ? 'is-active' : ''}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        Citação
      </button>

      <span className="tiptap-separator" />

      <button
        type="button"
        className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        Esq.
      </button>
      <button
        type="button"
        className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        Centro
      </button>
      <button
        type="button"
        className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        Dir.
      </button>

      <span className="tiptap-separator" />

      <button type="button" onClick={inserirImagem}>
        Imagem
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onArquivoSelecionado} />
      <button type="button" onClick={inserirVideo}>
        Vídeo
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        Tabela
      </button>
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        Separador
      </button>

      <span className="tiptap-separator" />

      <button type="button" onClick={() => editor.chain().focus().undo().run()}>
        Desfazer
      </button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()}>
        Refazer
      </button>
    </div>
  )
}
