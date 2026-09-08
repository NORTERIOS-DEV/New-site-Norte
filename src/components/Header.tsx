import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { navItems } from '../data/site'
import type { NavItem } from '../data/types'
import { waLink, waMessages } from '../data/contact'
import { useHeaderShadow } from '../hooks/useHeaderShadow'
import { LogoWordmark } from './LogoWordmark'
import { Btn } from './Btn'

function linkTo(item: NavItem, onHome: boolean): string {
  if (item.to) return item.to
  const anchor = item.anchor ?? 'top'
  if (anchor === 'contato') return '#contato' // rodapé existe em todas as rotas
  if (onHome) return `#${anchor}`
  return anchor === 'top' ? '/' : `/#${anchor}`
}

export function Header() {
  const location = useLocation()
  const onHome = location.pathname === '/'
  const scrolled = useHeaderShadow()
  const [navOpen, setNavOpen] = useState(false)

  // fecha o menu mobile ao navegar
  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname, location.hash, location.key])

  // o CSS legado mira `body.nav-open`
  useEffect(() => {
    document.body.classList.toggle('nav-open', navOpen)
    return () => document.body.classList.remove('nav-open')
  }, [navOpen])

  return (
    <header id="top" className={scrolled ? 'scrolled' : undefined}>
      <div className="wrap nav">
        <Link
          to={onHome ? '#top' : '/'}
          className="brand"
          aria-label="Norte Rios — início"
        >
          <LogoWordmark />
        </Link>

        <nav className="menu" aria-label="Principal">
          {navItems.map((item) => (
            <Link key={item.label} to={linkTo(item, onHome)}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="nav-cta">
          <Btn href={waLink(waMessages.reuniao)} arrow>
            Agendar reunião
          </Btn>
          <button
            className="burger"
            aria-label="Abrir menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
      </div>

      <nav className="mobile-menu" aria-label="Menu móvel">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={linkTo(item, onHome)}
            onClick={() => setNavOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <Btn href={waLink(waMessages.reuniao)} onClick={() => setNavOpen(false)}>
          Agendar reunião
        </Btn>
      </nav>
    </header>
  )
}
