import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { AuthProvider } from './context/AuthContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import './styles/tokens.css'
import './styles/global.css'

// Espelha o comportamento do site legado: a animação de "reveal" só é armada
// quando o usuário não pediu redução de movimento (sem a classe `js`, o CSS
// deixa todo o conteúdo visível).
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('js')
}

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <ToastContainer aria-label="Notificações"/>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
