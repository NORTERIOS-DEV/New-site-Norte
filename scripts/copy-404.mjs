// Fallback de SPA para hosts estáticos (GitHub Pages, etc.): serve `index.html`
// para qualquer rota do cliente copiando-o como `404.html`.
import { copyFileSync, existsSync } from 'node:fs'

const src = new URL('../dist/index.html', import.meta.url)
const dest = new URL('../dist/404.html', import.meta.url)

if (existsSync(src)) {
  copyFileSync(src, dest)
  console.log('copy-404: dist/index.html -> dist/404.html')
} else {
  console.warn('copy-404: dist/index.html não encontrado; pulei.')
}
