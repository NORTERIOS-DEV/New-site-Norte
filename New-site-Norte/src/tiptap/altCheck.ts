import type { JSONContent } from '@tiptap/core'

/** Espelha blog/validators.py:contem_imagem_sem_alt - checagem client-side
 * pra dar feedback imediato antes de publicar; o backend continua sendo a
 * fonte de verdade (mesma regra reaplicada lá). */
export function contemImagemSemAlt(node: JSONContent | null): boolean {
  if (!node) return false

  if (node.type === 'image') {
    const alt = node.attrs?.alt
    if (!alt || !String(alt).trim()) return true
  }

  return (node.content ?? []).some((child) => contemImagemSemAlt(child))
}
