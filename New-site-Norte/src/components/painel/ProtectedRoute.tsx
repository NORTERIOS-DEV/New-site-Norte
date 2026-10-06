import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div className="painel-loading">Carregando…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/painel/login" replace state={{ from: location }} />
  }

  const section = location.pathname.split('/')[2]
  if (!section) return <Navigate to={user?.tipo === 'comum' ? '/painel/perfil' : '/painel/posts'} replace />
  if (section !== 'perfil' && user?.tipo !== 'gerente' && (user?.tipo !== 'autor' || section !== 'posts')) {
    return <Navigate to="/painel/perfil" replace />
  }
  return <Outlet />
}
