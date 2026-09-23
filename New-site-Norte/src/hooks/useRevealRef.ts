import { useCallback } from 'react'

/**
 * Callback ref que reproduz o "reveal on scroll" do site legado: adiciona a
 * classe `in` quando o elemento entra na viewport (mesmos parâmetros do
 * IntersectionObserver original). Sob `prefers-reduced-motion`, aplica `in`
 * imediatamente.
 */
export function useRevealRef<T extends HTMLElement = HTMLElement>() {
  return useCallback((el: T | null) => {
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('in')
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    io.observe(el)

    return () => io.disconnect()
  }, [])
}
