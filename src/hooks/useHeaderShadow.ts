import { useEffect, useState } from 'react'

/** `true` quando a página rolou mais que `threshold`px — liga a sombra do header. */
export function useHeaderShadow(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(() => window.scrollY > threshold)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}
