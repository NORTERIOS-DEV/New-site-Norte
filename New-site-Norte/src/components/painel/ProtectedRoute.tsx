import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div className="painel-loading">Carregando…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/painel/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
