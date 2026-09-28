import type { JSONContent } from '@tiptap/core'

const WORDS_PER_MINUTE = 200

/** Espelho de blog/utils.py:estimate_reading_time - usado para a estimativa
 * ao vivo no formulário; o backend recalcula o mesmo valor como fallback
 * caso o campo chegue vazio. */
export function estimateReadingTime(content: JSONContent | null | undefined): number | null {
  if (!content) return null

  const chunks: string[] = []
  function walk(node: JSONContent) {
    if (typeof node.text === 'string') chunks.push(node.text)
    node.content?.forEach(walk)
  }
  walk(content)

  const wordCount = chunks.join(' ').trim().split(/\s+/).filter(Boolean).length
  if (wordCount === 0) return null
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE))
}
