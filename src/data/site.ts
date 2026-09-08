import type { NavItem } from './types'

export const brand = {
  name: 'Norte Rios',
  tagline: 'Gestão e Treinamentos em Educação',
}

export const navItems: NavItem[] = [
  { label: 'Início', anchor: 'top' },
  { label: 'Publicações', to: '/publicacoes' },
  { label: 'Sobre', anchor: 'sobre' },
  { label: 'Serviços', anchor: 'servicos' },
  { label: 'Contato', anchor: 'contato' },
]

/** URL canônica pública, usada nas metatags. */
export const siteUrl = 'https://norterios.com.br'
