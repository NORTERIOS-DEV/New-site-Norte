import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogoMark } from '../LogoMark'
import '../../styles/painel.css'

const NAV_ITEMS = [
  { to: '/painel/posts', label: 'Postagens' },
  { to: '/painel/categorias', label: 'Categorias' },
  { to: '/painel/autores', label: 'Autores' },
  { to: '/painel/galeria', label: 'Galeria' },
]

export function PainelLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // fecha a sidebar (tablet/celular) ao navegar entre telas do painel
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className={`painel-shell${sidebarOpen ? ' sidebar-open' : ''}`}>
      <button
        type="button"
        className="painel-sidebar-backdrop"
        aria-hidden="true"
        tabIndex={-1}
        onClick={() => setSidebarOpen(false)}
      />
      <aside className="painel-sidebar">
        <div className="painel-sidebar-brand">
          <LogoMark className="painel-sidebar-logo" />
          <span>Norte Rios</span>
        </div>
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
          <button
            type="button"
            className="painel-sidebar-toggle"
            data-tooltip={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <span />
          </button>
          <span className="painel-topbar-user">{user?.first_name || user?.username}</span>
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
