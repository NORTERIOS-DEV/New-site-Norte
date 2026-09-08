import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'

import './styles/tokens.css'
import './styles/global.css'

// Espelha o comportamento do site legado: a animação de "reveal" só é armada
// quando o usuário não pediu redução de movimento (sem a classe `js`, o CSS
// deixa todo o conteúdo visível).
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('js')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
