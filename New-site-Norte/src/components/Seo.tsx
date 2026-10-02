import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { siteUrl } from '../data/site'

type SeoProps = {
  title: string
  description: string
  /** Sobrescreve as tags Open Graph (og:title/og:description/og:image) -
   * usadas por previews de compartilhamento (WhatsApp, redes sociais).
   * Se omitidas, caem no mesmo valor de `title`/`description`. */
  ogTitle?: string
  ogDescription?: string
  ogImage?: string | null
}

/** Define <title>, <meta name="description">, <link rel="canonical"> e as
 * tags Open Graph por rota. */
export function Seo({ title, description, ogTitle, ogDescription, ogImage }: SeoProps) {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = title

    const meta = ensureHeadEl('meta', 'name', 'description')
    meta.setAttribute('content', description)

    const canonical = ensureHeadEl('link', 'rel', 'canonical')
    const url = siteUrl + (pathname === '/' ? '' : pathname)
    canonical.setAttribute('href', url)

    ensureHeadEl('meta', 'property', 'og:title').setAttribute('content', ogTitle ?? title)
    ensureHeadEl('meta', 'property', 'og:description').setAttribute('content', ogDescription ?? description)
    ensureHeadEl('meta', 'property', 'og:url').setAttribute('content', url)

    const ogImageEl = ensureHeadEl('meta', 'property', 'og:image')
    if (ogImage) {
      ogImageEl.setAttribute('content', ogImage)
    } else {
      ogImageEl.remove()
    }
  }, [title, description, ogTitle, ogDescription, ogImage, pathname])

  return null
}

function ensureHeadEl(tag: string, attr: string, value: string): Element {
  const selector = `${tag}[${attr}="${value}"]`
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement(tag)
    el.setAttribute(attr, value)
    document.head.appendChild(el)
  }
  return el
}
