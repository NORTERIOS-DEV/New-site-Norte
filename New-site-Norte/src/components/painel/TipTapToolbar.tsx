import type { Editor } from '@tiptap/core'
import { useCallback, useRef, type ChangeEvent, type ReactNode } from 'react'
import { uploadImagem } from '../../services/painel/uploadsApi'
import { promptForLink } from '../../tiptap/linkPrompt'
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconBold,
  IconHorizontalRule,
  IconImage,
  IconItalic,
  IconLink,
  IconListBullet,
  IconListOrdered,
  IconMaximize,
  IconMinimize,
  IconParagraph,
  IconQuote,
  IconRedo,
  IconTable,
  IconUnderline,
  IconUndo,
  IconVideo,
} from '../../tiptap/toolbarIcons'

type TipTapToolbarProps = {
  editor: Editor | null
  maximizado: boolean
  onAlternarMaximizado: () => void
}

const HEADING_LEVELS = [1, 2, 3] as const

type ToolbarButtonProps = {
  title: string
  active?: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}

function ToolbarButton({ title, active, onClick, children, className }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      data-tooltip={title}
      className={`${active ? 'is-active' : ''}${className ? ` ${className}` : ''}`}
      onClick={onClick}
    >
      {children}
      <span className="tiptap-sr-only">{title}</span>
    </button>
  )
}

export function TipTapToolbar({ editor, maximizado, onAlternarMaximizado }: TipTapToolbarProps) {
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
      const alt = window.prompt('Texto alternativo da imagem (para acessibilidade e SEO):') ?? ''
      editor.chain().focus().setImage({ src: url, alt }).run()
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

  if (!editor) return null

  return (
    <div className="tiptap-toolbar">
      {HEADING_LEVELS.map((nivel) => (
        <ToolbarButton
          key={nivel}
          title={`Título ${nivel}`}
          active={editor.isActive('heading', { level: nivel })}
          className="tiptap-heading-btn"
          onClick={() => editor.chain().focus().toggleHeading({ level: nivel }).run()}
        >
          H{nivel}
        </ToolbarButton>
      ))}
      <ToolbarButton
        title="Parágrafo"
        active={editor.isActive('paragraph')}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        <IconParagraph />
      </ToolbarButton>

      <span className="tiptap-separator" />

      <ToolbarButton title="Negrito" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <IconBold />
      </ToolbarButton>
      <ToolbarButton
        title="Itálico"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <IconItalic />
      </ToolbarButton>
      <ToolbarButton
        title="Sublinhado"
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <IconUnderline />
      </ToolbarButton>
      <ToolbarButton title="Link" active={editor.isActive('link')} onClick={() => promptForLink(editor)}>
        <IconLink />
      </ToolbarButton>

      <span className="tiptap-separator" />

      <ToolbarButton
        title="Lista"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <IconListBullet />
      </ToolbarButton>
      <ToolbarButton
        title="Lista numerada"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <IconListOrdered />
      </ToolbarButton>
      <ToolbarButton
        title="Citação"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <IconQuote />
      </ToolbarButton>

      <span className="tiptap-separator" />

      <ToolbarButton
        title="Alinhar à esquerda"
        active={editor.isActive({ textAlign: 'left' })}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <IconAlignLeft />
      </ToolbarButton>
      <ToolbarButton
        title="Centralizar"
        active={editor.isActive({ textAlign: 'center' })}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <IconAlignCenter />
      </ToolbarButton>
      <ToolbarButton
        title="Alinhar à direita"
        active={editor.isActive({ textAlign: 'right' })}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <IconAlignRight />
      </ToolbarButton>

      <span className="tiptap-separator" />

      <ToolbarButton title="Imagem" onClick={inserirImagem}>
        <IconImage />
      </ToolbarButton>
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onArquivoSelecionado} />
      <ToolbarButton title="Vídeo" onClick={inserirVideo}>
        <IconVideo />
      </ToolbarButton>
      <ToolbarButton
        title="Tabela"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <IconTable />
      </ToolbarButton>
      <ToolbarButton title="Separador" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <IconHorizontalRule />
      </ToolbarButton>

      <span className="tiptap-separator" />

      <ToolbarButton title="Desfazer" onClick={() => editor.chain().focus().undo().run()}>
        <IconUndo />
      </ToolbarButton>
      <ToolbarButton title="Refazer" onClick={() => editor.chain().focus().redo().run()}>
        <IconRedo />
      </ToolbarButton>

      <ToolbarButton
        title={maximizado ? 'Restaurar editor' : 'Maximizar editor'}
        onClick={onAlternarMaximizado}
        className="tiptap-maximize-btn"
      >
        {maximizado ? <IconMinimize /> : <IconMaximize />}
      </ToolbarButton>
    </div>
  )
}
