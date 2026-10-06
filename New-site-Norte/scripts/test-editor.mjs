import assert from 'node:assert/strict'
import { Window } from 'happy-dom'
import { createServer } from 'vite'
import { Editor } from '@tiptap/core'
import { closeHistory } from '@tiptap/pm/history'
import { generateHTML, generateJSON } from '@tiptap/html/server'
import createDOMPurify from 'dompurify'
import { act, createElement, Fragment } from 'react'
import { createRoot } from 'react-dom/client'

const window = new Window()
for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Element', 'Node', 'DOMParser', 'MutationObserver']) {
  Object.defineProperty(globalThis, key, { configurable: true, value: key === 'window' ? window : window[key] })
}
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window)
globalThis.getComputedStyle = window.getComputedStyle.bind(window)
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const server = await createServer({
  configFile: false,
  server: { middlewareMode: true },
  appType: 'custom',
  optimizeDeps: { noDiscovery: true, include: [] },
})
let editor
let root
try {
  const { cleanPastedHtml } = await server.ssrLoadModule('/src/tiptap/pasteClean.ts')
  const { tiptapRenderExtensions } = await server.ssrLoadModule('/src/tiptap/renderExtensions.ts')
  const { tiptapExtensions } = await server.ssrLoadModule('/src/tiptap/extensions.ts')
  const extensions = tiptapRenderExtensions
  let removed = 0
  const cleaned = cleanPastedHtml(`
    <div style="font-family: Georgia; color: #427443; font-size: 24px; background: red" class="word">
      <p><span>Herdado <strong>negrito</strong></span><span style="color: blue">Azul</span></p>
      <font face="Verdana" color="red" size="5">Legado</font>
      <img src="data:image/png;base64,abc"><script>alert(1)</script>
    </div>`, () => removed++)
  assert.equal(removed, 1)
  assert.doesNotMatch(cleaned, /background|class=|<font|<script|data:image/)
  const pasted = generateJSON(cleaned, extensions)
  const texts = []
  function collect(node) {
    if (node.type === 'text') texts.push(node)
    node.content?.forEach(collect)
  }
  collect(pasted)
  const attrs = (text) => texts.find((node) => node.text.includes(text))?.marks?.find((mark) => mark.type === 'textStyle')?.attrs
  assert.equal(attrs('Herdado').fontFamily, 'Georgia')
  assert.equal(attrs('Herdado').fontSize, '24px')
  assert.equal(attrs('Herdado').color, '#427443')
  assert.equal(attrs('Azul').color, 'blue')
  assert.equal(attrs('Legado').fontFamily, 'Verdana')
  assert.equal(attrs('Legado').fontSize, '24px')
  assert(texts.find((node) => node.text === 'negrito').marks.some((mark) => mark.type === 'bold'))

  editor = new Editor({ extensions: tiptapExtensions, content: '<p>Primeiro segundo</p>' })
  editor.commands.setTextSelection({ from: 1, to: 9 })
  editor.chain().setFontFamily('Georgia, serif').setFontSize('24px').setColor('#427443').toggleBold().run()
  const saved = editor.getJSON()
  assert.equal(saved.content[0].content[1].marks, undefined)
  const styled = saved.content[0].content[0].marks.find((mark) => mark.type === 'textStyle').attrs
  assert.equal(styled.fontFamily, 'Georgia, serif')
  assert.equal(styled.fontSize, '24px')
  assert.equal(styled.color, '#427443')
  const html = createDOMPurify(window).sanitize(generateHTML(saved, extensions))
  assert.match(html, /font-family: Georgia, serif/)
  assert.match(html, /font-size: 24px/)
  assert.match(html, /color:/)
  editor.commands.setContent(saved)
  assert.deepEqual(editor.getJSON(), saved)
  editor.commands.setTextSelection({ from: 1, to: 9 })
  editor.commands.unsetColor()
  const reset = editor.getJSON().content[0].content[0].marks.find((mark) => mark.type === 'textStyle').attrs
  assert.equal(reset.color, null)
  assert.equal(reset.fontSize, '24px')
  editor.chain().unsetFontSize().unsetFontFamily().run()
  assert(!editor.getJSON().content[0].content[0].marks.some((mark) => mark.type === 'textStyle'))
  // Nova transação isolada para verificar o histórico.
  editor.commands.setContent('<p>Texto</p>')
  editor.commands.setTextSelection({ from: 1, to: 6 })
  editor.commands.setFontSize('32px')
  editor.commands.undo()
  assert.doesNotMatch(editor.getHTML(), /font-size/)
  editor.commands.redo()
  assert.match(editor.getHTML(), /font-size: 32px/)
  editor.commands.setTextSelection(6)
  editor.commands.setColor('#ff0000')
  editor.commands.insertContent(' novo')
  assert(editor.getJSON().content[0].content.some((node) => node.text.includes('novo') &&
    node.marks.some((mark) => mark.type === 'textStyle' && mark.attrs.color === '#ff0000')))
  assert.equal(generateHTML({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Antigo' }] }] }, extensions), '<p>Antigo</p>')
  const { TipTapTextStyleControls } = await server.ssrLoadModule('/src/components/painel/TipTapTextStyleControls.tsx')
  const container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  editor.commands.setContent(saved)
  editor.commands.setTextSelection({ from: 1, to: 16 })
  await act(async () => root.render(createElement(TipTapTextStyleControls, { editor })))
  const fontSelect = container.querySelector('[aria-label="Fonte"]')
  const sizeSelect = container.querySelector('[aria-label="Tamanho da fonte"]')
  assert.equal(fontSelect.selectedOptions[0].textContent, 'Mistas')
  assert.equal(sizeSelect.selectedOptions[0].textContent, 'Mistos')
  await act(async () => {
    sizeSelect.value = '18px'
    sizeSelect.dispatchEvent(new window.Event('change', { bubbles: true }))
  })
  assert.equal(editor.state.selection.from, 1)
  assert.equal(editor.state.selection.to, 16)
  assert.equal(sizeSelect.value, '18px')
  await act(async () => {
    editor.commands.setTextSelection({ from: 1, to: 9 })
    editor.chain().setFontFamily('Custom Font').setFontSize('22pt').run()
  })
  assert.equal(fontSelect.selectedOptions[0].textContent, 'Custom Font')
  assert.equal(sizeSelect.selectedOptions[0].textContent, '22pt')
  await act(async () => {
    container.querySelector('[aria-label="Restaurar cor padrão"]').dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
  })
  assert.equal(editor.getAttributes('textStyle').color, null)
  assert.equal(editor.getAttributes('textStyle').fontSize, '22pt')
  const { TipTapToolbar } = await server.ssrLoadModule('/src/components/painel/TipTapToolbar.tsx')
  const { TipTapTableMenu } = await server.ssrLoadModule('/src/components/painel/TipTapTableMenu.tsx')
  document.body.appendChild(editor.view.dom)
  await act(async () => {
    editor.commands.setContent('<p>Antes</p><p>Depois</p>')
    editor.commands.setTextSelection(8)
    root.render(createElement(Fragment, null, createElement(TipTapToolbar, {
      editor, maximizado: false, onAlternarMaximizado: () => {},
    }), createElement(TipTapTableMenu, { editor })))
  })
  const excluirTabela = () => document.querySelector('.tiptap-table-menu button')
  assert.equal(container.querySelector('.tiptap-toolbar [data-tooltip="Excluir tabela"]'), null)
  await act(async () => {
    container.querySelector('[data-tooltip="Tabela"]').dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
  })
  assert.equal(editor.isActive('table'), true)
  assert(excluirTabela())
  assert.equal(container.querySelector('.tiptap-toolbar [data-tooltip="Excluir tabela"]'), null)
  const comTabela = editor.getJSON()
  await act(async () => {
    editor.view.dispatch(closeHistory(editor.state.tr))
    excluirTabela().dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
  })
  assert(!editor.getJSON().content.some((node) => node.type === 'table'))
  assert.match(editor.getText(), /Antes/)
  assert.match(editor.getText(), /Depois/)
  assert.equal(editor.isActive('table'), false)
  assert.equal(excluirTabela(), null)
  await act(async () => editor.commands.undo())
  assert.deepEqual(editor.getJSON(), comTabela)
  // A tabela também pode ser removida quando é o único conteúdo do post.
  await act(async () => {
    editor.commands.setContent({ type: 'doc', content: [comTabela.content.find((node) => node.type === 'table')] })
    editor.commands.setTextSelection(4)
  })
  assert(excluirTabela())
  await act(async () => {
    excluirTabela().dispatchEvent(new window.MouseEvent('click', { bubbles: true }))
  })
  assert(!editor.getJSON().content.some((node) => node.type === 'table'))
  assert(editor.state.doc.childCount > 0)
  console.log('OK: colagem, formatação, persistência, histórico, controles e exclusão de tabelas pelo menu flutuante.')
} finally {
  if (root) await act(async () => root.unmount())
  editor?.destroy()
  await server.close()
  await window.happyDOM.close()
}
