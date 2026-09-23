export type Categoria = {
  id: number
  nome: string
  slug: string
}

export type PostListItem = {
  id: number
  titulo: string
  slug: string
  resumo: string
  imagem_capa: string | null
  autor_nome: string
  categoria: Categoria | null
  data_publicacao: string
  destaque: boolean
}

export type PostDetail = PostListItem & {
  conteudo: string
}

export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
