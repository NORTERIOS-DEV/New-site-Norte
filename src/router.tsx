import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { PublicacoesPage } from './pages/PublicacoesPage'
import { EditalPage } from './pages/EditalPage'
import { BlogPage } from './pages/BlogPage'
import { BlogPostPage } from './pages/BlogPostPage'
import { NotFoundPage } from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'publicacoes', element: <PublicacoesPage /> },
      { path: 'publicacoes/:slug', element: <EditalPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'blog/:slug', element: <BlogPostPage /> },

      // Compatibilidade com as URLs do site legado (já indexadas / impressas).
      { path: 'index.html', element: <Navigate to="/" replace /> },
      { path: 'publicacoes.html', element: <Navigate to="/publicacoes" replace /> },
      {
        path: 'edital-002-2026.html',
        element: <Navigate to="/publicacoes/edital-002-2026" replace />,
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
