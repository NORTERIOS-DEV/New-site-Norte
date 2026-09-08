import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { siteUrl } from '../data/site'

type SeoProps = {
  title: string
  description: string
}

/** Define <title>, <meta name="description"> e <link rel="canonical"> por rota. */
export function Seo({ title, description }: SeoProps) {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = title

    const meta = ensureHeadEl('meta', 'name', 'description')
    meta.setAttribute('content', description)

    const canonical = ensureHeadEl('link', 'rel', 'canonical')
    canonical.setAttribute('href', siteUrl + (pathname === '/' ? '' : pathname))
  }, [title, description, pathname])

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
