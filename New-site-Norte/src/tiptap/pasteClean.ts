// Limpa HTML colado do Word/Google Docs antes do TipTap converter pra
// documento: boa parte da limpeza já acontece "de graça" (o parser do
// ProseMirror ignora tags/atributos que nenhuma extensão do schema
// reconhece, por isso cores/fontes livres do Google Docs já não aparecem
// mesmo sem este util) - aqui cobrimos o residual: atributos de
// estilo/estrutura do Word, wrappers vazios (span/font/o:p) e, mais
// importante, imagens em base64 coladas junto com o HTML (nunca inserir
// base64 no conteúdo - ver handlePaste/handleDrop em TipTapEditor.tsx pro
// fluxo correto de upload de imagem real).

const TAGS_PARA_REMOVER = ['style', 'script', 'meta', 'link', 'title']
const TAGS_PARA_DESEMBRULHAR = new Set(['SPAN', 'FONT', 'O:P'])
const ATRIBUTOS_PARA_REMOVER = ['style', 'class', 'lang', 'dir', 'align', 'valign', 'id']

export function cleanPastedHtml(html: string, onImagemBase64Removida?: () => void): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')

  doc.querySelectorAll(TAGS_PARA_REMOVER.join(',')).forEach((el) => el.remove())

  const paraDesembrulhar: Element[] = []

  doc.body.querySelectorAll('*').forEach((el) => {
    if (el.tagName === 'IMG' && (el.getAttribute('src') ?? '').startsWith('data:')) {
      el.remove()
      onImagemBase64Removida?.()
      return
    }

    for (const atributo of ATRIBUTOS_PARA_REMOVER) {
      el.removeAttribute(atributo)
    }
    Array.from(el.attributes)
      .filter((attr) => attr.name.startsWith('data-'))
      .forEach((attr) => el.removeAttribute(attr.name))

    if (TAGS_PARA_DESEMBRULHAR.has(el.tagName)) {
      paraDesembrulhar.push(el)
    }
  })

  for (const el of paraDesembrulhar) {
    const pai = el.parentNode
    if (!pai) continue
    while (el.firstChild) pai.insertBefore(el.firstChild, el)
    pai.removeChild(el)
  }

  return doc.body.innerHTML
}
