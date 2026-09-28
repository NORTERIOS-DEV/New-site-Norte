import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/painel.css'

const NAV_ITEMS = [
  { to: '/painel/posts', label: 'Postagens' },
  { to: '/painel/categorias', label: 'Categorias' },
  { to: '/painel/autores', label: 'Autores' },
  { to: '/painel/galeria', label: 'Galeria' },
]

export function PainelLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="painel-shell">
      <aside className="painel-sidebar">
        <div className="painel-sidebar-brand">Norte Rios</div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="painel-main">
        <header className="painel-topbar">
          <span>{user?.first_name || user?.username}</span>
          <button type="button" onClick={logout}>
            Sair
          </button>
        </header>
        <main className="painel-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
