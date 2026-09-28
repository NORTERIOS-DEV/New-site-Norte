import type { JSONContent } from '@tiptap/core'

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
  tempo_leitura_minutos: number | null
}

export type PostDetail = PostListItem & {
  /** HTML legado (CKEditor5) - só preenchido em posts criados antes do editor
   * TipTap; SafeContent usa conteudo_json quando presente e cai pra isso. */
  conteudo: string
  conteudo_json: JSONContent | null
}

export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
