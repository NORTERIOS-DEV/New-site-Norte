/** Espelho em JS do slugify usado no backend (blog/models.py _generate_unique_slug),
 * só para o preview ao vivo no formulário - a fonte da verdade de unicidade
 * continua sendo o backend. */

// Faixa Unicode "Combining Diacritical Marks" (acentos isolados por normalize('NFD')).
const COMBINING_MARK_START = 0x0300
const COMBINING_MARK_END = 0x036f

function stripCombiningMarks(value: string): string {
  let result = ''
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0
    if (code < COMBINING_MARK_START || code > COMBINING_MARK_END) {
      result += char
    }
  }
  return result
}

export function slugify(value: string): string {
  return stripCombiningMarks(value.normalize('NFD'))
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
