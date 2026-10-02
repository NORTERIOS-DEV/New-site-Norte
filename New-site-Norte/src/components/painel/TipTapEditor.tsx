import { useEditor, EditorContent, type JSONContent } from '@tiptap/react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { tiptapExtensions } from '../../tiptap/extensions'
import { cleanPastedHtml } from '../../tiptap/pasteClean'
import { uploadImagem } from '../../services/painel/uploadsApi'
import { TipTapToolbar } from './TipTapToolbar'
import { TipTapBubbleMenu } from './TipTapBubbleMenu'
import '../../styles/tiptap.css'

/** Faz upload de uma imagem solta via paste/drop e insere o node na posição
 * dada - nunca base64, sempre a URL retornada pelo endpoint de upload
 * (mesmo endpoint usado pelo botão de imagem da toolbar). */
function enviarEInserirImagem(view: import('@tiptap/pm/view').EditorView, file: File, pos?: number) {
  const posicao = pos ?? view.state.selection.from
  const toastId = toast.loading('Enviando imagem…')
  uploadImagem(file)
    .then((url) => {
      const node = view.state.schema.nodes.image.create({ src: url, alt: '' })
      view.dispatch(view.state.tr.insert(posicao, node))
      toast.update(toastId, { render: 'Imagem inserida.', type: 'success', isLoading: false, autoClose: 2000 })
    })
    .catch(() => {
      toast.update(toastId, { render: 'Falha ao enviar imagem.', type: 'error', isLoading: false, autoClose: 3000 })
    })
}

type TipTapEditorProps = {
  content: JSONContent | null
  onChange: (content: JSONContent) => void
}

// StarterKit registra a extensão Heading antes de Paragraph (ver
// node_modules/@tiptap/starter-kit), então o tipo de bloco "default" do
// ProseMirror para um doc vazio acaba sendo heading, não paragraph - um
// post novo sem conteúdo nenhum começaria com o primeiro bloco como título
// em vez de parágrafo. `content: ''` deixa o TipTap preencher isso sozinho
// (com esse resultado errado); um doc explícito com um parágrafo vazio evita
// o problema.
const DOC_VAZIO: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] }

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const [maximizado, setMaximizado] = useState(false)

  const editor = useEditor({
    extensions: tiptapExtensions,
    content: content ?? DOC_VAZIO,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      transformPastedHTML: (html) =>
        cleanPastedHtml(html, () =>
          toast.info('Imagens coladas em HTML não são inseridas — use arrastar-e-soltar ou o botão de imagem.'),
        ),
      handlePaste: (view, event) => {
        const arquivos = Array.from(event.clipboardData?.files ?? []).filter((f) => f.type.startsWith('image/'))
        if (!arquivos.length) return false
        enviarEInserirImagem(view, arquivos[0])
        return true
      },
      handleDrop: (view, event) => {
        const arquivos = Array.from(event.dataTransfer?.files ?? []).filter((f) => f.type.startsWith('image/'))
        if (!arquivos.length) return false
        event.preventDefault()
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY })
        enviarEInserirImagem(view, arquivos[0], coords?.pos)
        return true
      },
      handleDOMEvents: {
        dblclick: (view, event) => {
          const target = event.target as HTMLElement
          if (target.tagName !== 'IMG') return false
          const pos = view.posAtDOM(target, 0)
          const node = view.state.doc.nodeAt(pos)
          if (!node || node.type.name !== 'image') return false
          const altAtual = (node.attrs.alt as string | null) ?? ''
          const novoAlt = window.prompt('Texto alternativo da imagem:', altAtual)
          if (novoAlt === null) return true
          view.dispatch(view.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, alt: novoAlt }))
          return true
        },
      },
    },
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

  // Enquanto maximizado: trava o scroll da página por trás e permite sair com Esc.
  useEffect(() => {
    if (!maximizado) return
    document.body.classList.add('tiptap-scroll-lock')
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMaximizado(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('tiptap-scroll-lock')
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [maximizado])

  return (
    <div className={`tiptap-editor${maximizado ? ' tiptap-editor--maximizado' : ''}`}>
      <TipTapToolbar editor={editor} maximizado={maximizado} onAlternarMaximizado={() => setMaximizado((v) => !v)} />
      {editor && <TipTapBubbleMenu editor={editor} />}
      <EditorContent editor={editor} className="tiptap-content" />
    </div>
  )
}
