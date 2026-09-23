export type NavItem = {
  label: string
  /** Âncora dentro da home (ex.: "sobre" → "#sobre" / "/#sobre"). */
  anchor?: string
  /** Rota interna (ex.: "/blog"). */
  to?: string
}

export type ServiceArea = {
  id: 'adm' | 'ped' | 'fin' | 'sis'
  aba: string
  titulo: string
  descricao: string
  itens: string[]
}
