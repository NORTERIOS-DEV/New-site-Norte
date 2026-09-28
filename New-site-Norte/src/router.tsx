import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { BlogPage } from './pages/BlogPage'
import { GaleriaPage } from './pages/GaleriaPage'
import { GaleriaAlbumPage } from './pages/GaleriaAlbumPage'
import { NotFoundPage } from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'blog', element: <BlogPage /> },
      // Lazy: é a única página pública que usa TipTap (generateHTML via
      // SafeContent) - lazy aqui evita que StarterKit/extensões entrem no
      // chunk principal que toda página pública carrega (home, listas etc).
      {
        path: 'blog/:slug',
        lazy: () => import('./pages/BlogPostPage').then((m) => ({ Component: m.BlogPostPage })),
      },
      { path: 'galeria', element: <GaleriaPage /> },
      { path: 'galeria/:slug', element: <GaleriaAlbumPage /> },

      // Compatibilidade com as URLs do site legado (já indexadas / impressas).
      { path: 'index.html', element: <Navigate to="/" replace /> },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // Painel administrativo: fora do <Layout> público (sem header/footer do site) e
  // com code-splitting via `lazy` - TipTap/dnd-kit/react-hook-form nunca entram
  // no bundle do site público, só carregam quando alguém navega para /painel.
  {
    path: 'painel/login',
    lazy: () => import('./pages/painel/LoginPage').then((m) => ({ Component: m.LoginPage })),
  },
  {
    path: 'painel',
    lazy: () => import('./components/painel/ProtectedRoute').then((m) => ({ Component: m.ProtectedRoute })),
    children: [
      {
        lazy: () => import('./components/painel/PainelLayout').then((m) => ({ Component: m.PainelLayout })),
        children: [
          { index: true, element: <Navigate to="posts" replace /> },
          {
            path: 'posts',
            lazy: () => import('./pages/painel/PostsListPage').then((m) => ({ Component: m.PostsListPage })),
          },
          {
            path: 'posts/novo',
            lazy: () => import('./pages/painel/PostFormPage').then((m) => ({ Component: m.PostFormPage })),
          },
          {
            path: 'posts/:id/editar',
            lazy: () => import('./pages/painel/PostFormPage').then((m) => ({ Component: m.PostFormPage })),
          },
          {
            path: 'categorias',
            lazy: () =>
              import('./pages/painel/CategoriasListPage').then((m) => ({ Component: m.CategoriasListPage })),
          },
          {
            path: 'autores',
            lazy: () => import('./pages/painel/AutoresListPage').then((m) => ({ Component: m.AutoresListPage })),
          },
          {
            path: 'galeria',
            lazy: () => import('./pages/painel/GaleriaListPage').then((m) => ({ Component: m.GaleriaListPage })),
          },
          {
            path: 'galeria/novo',
            lazy: () => import('./pages/painel/AlbumFormPage').then((m) => ({ Component: m.AlbumFormPage })),
          },
          {
            path: 'galeria/:id',
            lazy: () => import('./pages/painel/AlbumFormPage').then((m) => ({ Component: m.AlbumFormPage })),
          },
        ],
      },
    ],
  },
])
