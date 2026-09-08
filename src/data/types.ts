export type NavItem = {
  label: string
  /** Âncora dentro da home (ex.: "sobre" → "#sobre" / "/#sobre"). */
  anchor?: string
  /** Rota interna (ex.: "/publicacoes"). */
  to?: string
}

/** Trecho de texto que pode conter um link inline. */
export type RichPart = string | { text: string; href: string }

export type Publicacao = {
  slug: string
  selo: string
  titulo: string
  descricao: string
  datasLabel: string
  coverAlt: string
  cover: string
  coverMobile: string
  ctaLabel: string
}

export type DocIcon = 'file' | 'calendar' | 'curriculo' | 'check' | 'lgpd'

export type EditalDocumento = {
  titulo: string
  arquivo: string
  tamanho: string
  icon: DocIcon
}

export type Edital = {
  slug: string
  seo: { title: string; description: string }
  numero: string
  statusTag: string
  titulo: string
  resumo: string
  inscricoesLabel: string
  inscricaoUrl: string
  cronograma: { ato: string; data: string }[]
  cronogramaNota: RichPart[]
  eixos: { titulo: string; descricao: string }[]
  requisitos: string[]
  requisitosNota: RichPart[]
  documentos: EditalDocumento[]
  documentosNota: string
}

export type ServiceArea = {
  id: 'adm' | 'ped' | 'fin' | 'sis'
  aba: string
  titulo: string
  descricao: string
  itens: string[]
}
