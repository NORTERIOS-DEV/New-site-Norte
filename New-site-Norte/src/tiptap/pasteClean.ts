// Resolve a herança antes de remover wrappers e estilos do Word/Google Docs.
const TAGS_PARA_REMOVER = ['style', 'script', 'meta', 'link', 'title']
const TAGS_PARA_DESEMBRULHAR = new Set(['SPAN', 'FONT', 'O:P'])
const ATRIBUTOS_PARA_REMOVER = ['style', 'class', 'lang', 'dir', 'align', 'valign', 'id', 'face', 'color', 'size']
const PROPRIEDADES = ['font-family', 'color', 'font-size'] as const
type Estilos = Partial<Record<typeof PROPRIEDADES[number], string>>
const TAMANHOS_LEGADOS = ['10px', '13px', '16px', '18px', '24px', '32px', '48px']

export function cleanPastedHtml(html: string, onImagemBase64Removida?: () => void): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.querySelectorAll(TAGS_PARA_REMOVER.join(',')).forEach((el) => el.remove())

  function limpar(el: HTMLElement, herdados: Estilos) {
    if (el.tagName === 'IMG' && /^data:/i.test(el.getAttribute('src') ?? '')) {
      el.remove()
      onImagemBase64Removida?.()
      return
    }
    const estilos = { ...herdados }
    const normalizador = doc.createElement('span').style
    if (el.tagName === 'FONT') {
      normalizador.fontFamily = el.getAttribute('face') ?? ''
      normalizador.color = el.getAttribute('color') ?? ''
      const tamanho = el.getAttribute('size') ?? ''
      if (/^[1-7]$/.test(tamanho)) normalizador.fontSize = TAMANHOS_LEGADOS[Number(tamanho) - 1]
    }
    for (const propriedade of PROPRIEDADES) {
      const valor = el.style.getPropertyValue(propriedade) || normalizador.getPropertyValue(propriedade)
      if (valor && !/^(inherit|unset|revert|revert-layer)$/i.test(valor)) {
        if (valor === 'initial') delete estilos[propriedade]
        else if (!/var\(|url\(|expression\(/i.test(valor)) estilos[propriedade] = valor
      }
    }
    for (const atributo of ATRIBUTOS_PARA_REMOVER) el.removeAttribute(atributo)
    Array.from(el.attributes)
      .filter((attr) => attr.name.startsWith('data-') || attr.name.toLowerCase().startsWith('on'))
      .forEach((attr) => el.removeAttribute(attr.name))

    for (const child of Array.from(el.childNodes)) {
      if (child instanceof HTMLElement) limpar(child, estilos)
      else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim() && Object.keys(estilos).length) {
        const span = doc.createElement('span')
        for (const propriedade of PROPRIEDADES) {
          const valor = estilos[propriedade]
          if (valor) span.style.setProperty(propriedade, valor)
        }
        child.replaceWith(span)
        span.appendChild(child)
      }
    }
    if (TAGS_PARA_DESEMBRULHAR.has(el.tagName)) el.replaceWith(...Array.from(el.childNodes))
  }
  limpar(doc.body, {})
  return doc.body.innerHTML
}
