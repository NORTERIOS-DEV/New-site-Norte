import type { ReactNode } from 'react'
import type { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'

const FONTES = [
  ['Arial', 'Arial, sans-serif'],
  ['Verdana', 'Verdana, sans-serif'],
  ['Georgia', 'Georgia, serif'],
  ['Times New Roman', '"Times New Roman", serif'],
  ['Courier New', '"Courier New", monospace'],
] as const
const TAMANHOS = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((size) => `${size}px`)
const MISTO = '__mixed__'

function atributoSelecionado(editor: Editor, atributo: string): string {
  const { from, to, empty, $from } = editor.state.selection
  if (empty) {
    const marks = editor.state.storedMarks ?? $from.marks()
    return marks.find((mark) => mark.type.name === 'textStyle')?.attrs[atributo] ?? ''
  }
  const valores = new Set<string>()
  editor.state.doc.nodesBetween(from, to, (node) => {
    if (node.isText) valores.add(node.marks.find((mark) => mark.type.name === 'textStyle')?.attrs[atributo] ?? '')
  })
  return valores.size > 1 ? MISTO : [...valores][0] ?? ''
}

function corHex(value: string): string {
  if (/^#[0-9a-f]{6}$/i.test(value)) return value
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return '#101828'
  ctx.fillStyle = '#101828'
  ctx.fillStyle = value
  return /^#[0-9a-f]{6}$/i.test(ctx.fillStyle) ? ctx.fillStyle : '#101828'
}

export function TipTapTextStyleControls({ editor, children }: { editor: Editor; children?: ReactNode }) {
  const estilos = useEditorState({
    editor,
    selector: ({ editor }) => ({
      fonte: atributoSelecionado(editor, 'fontFamily'),
      tamanho: atributoSelecionado(editor, 'fontSize'),
      cor: atributoSelecionado(editor, 'color'),
    }),
  })

  function ajustarTamanho(delta: number) {
    const atual = Number.parseFloat(estilos.tamanho) || 16
    const unidade = estilos.tamanho.endsWith('pt') ? 'pt' : 'px'
    editor.chain().focus().setFontSize(`${Math.min(96, Math.max(8, atual + delta))}${unidade}`).run()
  }

  return (
    <div className="tiptap-text-style-controls">
      <label className="tiptap-font-control"><span className="tiptap-sr-only">Fonte</span>
        <select aria-label="Fonte" value={estilos.fonte} onChange={(event) => {
          const value = event.target.value
          const chain = editor.chain().focus()
          if (value) chain.setFontFamily(value).run()
          else chain.unsetFontFamily().run()
        }}>
          <option value="">Padrão</option>
          {estilos.fonte === MISTO && <option value={MISTO} disabled>Mistas</option>}
          {estilos.fonte && estilos.fonte !== MISTO && !FONTES.some(([, value]) => value === estilos.fonte) &&
            <option value={estilos.fonte}>{estilos.fonte}</option>}
          {FONTES.map(([label, value]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <div className="tiptap-size-control" role="group" aria-label="Tamanho do texto">
      <button type="button" aria-label="Diminuir tamanho da fonte" data-tooltip="Diminuir tamanho da fonte" onClick={() => ajustarTamanho(-1)}>&minus;</button>
      <label><span className="tiptap-sr-only">Tamanho</span>
        <select aria-label="Tamanho da fonte" value={estilos.tamanho} onChange={(event) => {
          const value = event.target.value
          const chain = editor.chain().focus()
          if (value) chain.setFontSize(value).run()
          else chain.unsetFontSize().run()
        }}>
          <option value="">Padrão</option>
          {estilos.tamanho === MISTO && <option value={MISTO} disabled>Mistos</option>}
          {estilos.tamanho && estilos.tamanho !== MISTO && !TAMANHOS.includes(estilos.tamanho) &&
            <option value={estilos.tamanho}>{estilos.tamanho}</option>}
          {TAMANHOS.map((value) => <option key={value} value={value}>{value.replace('px', '')}</option>)}
        </select>
      </label>
      <button type="button" aria-label="Aumentar tamanho da fonte" data-tooltip="Aumentar tamanho da fonte" onClick={() => ajustarTamanho(1)}>+</button>
      </div>
      {children}
      <label className="tiptap-color-control" title="Cor do texto" style={{ '--text-color': corHex(estilos.cor) } as import('react').CSSProperties}>
        <span aria-hidden="true">A</span>
        <input type="color" aria-label="Cor do texto" value={corHex(estilos.cor)}
          onChange={(event) => editor.chain().focus().setColor(event.target.value).run()} />
      </label>
      <span className="tiptap-sr-only" aria-live="polite">
        {estilos.cor === MISTO ? 'Mistas' : estilos.cor ? corHex(estilos.cor) : 'Padrão'}
      </span>
      <button type="button" className="tiptap-color-reset" aria-label="Restaurar cor padrão"
        onClick={() => editor.chain().focus().unsetColor().run()}>&#8634;<span className="tiptap-sr-only">Cor padrão</span></button>
    </div>
  )
}
