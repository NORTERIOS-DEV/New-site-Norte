import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Ao trocar de rota: rola para a âncora do `hash` (ex.: `/#sobre`) ou para o
 * topo quando não há hash. `html { scroll-behavior:smooth }` cuida da animação.
 */
export function ScrollManager() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) {
        target.scrollIntoView({ block: 'start' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash, key])

  return null
}
