import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { BlogPage } from './pages/BlogPage'
import { BlogPostPage } from './pages/BlogPostPage'
import { GaleriaPage } from './pages/GaleriaPage'
import { GaleriaAlbumPage } from './pages/GaleriaAlbumPage'
import { NotFoundPage } from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'blog/:slug', element: <BlogPostPage /> },
      { path: 'galeria', element: <GaleriaPage /> },
      { path: 'galeria/:slug', element: <GaleriaAlbumPage /> },

      // Compatibilidade com as URLs do site legado (já indexadas / impressas).
      { path: 'index.html', element: <Navigate to="/" replace /> },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
