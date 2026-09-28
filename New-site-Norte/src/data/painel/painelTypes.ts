import type { JSONContent } from '@tiptap/core'

export type Autor = {
  id: number
  nome: string
  foto: string | null
  mini_bio: string
  cargo: string
  ativo: boolean
}

export type Categoria = {
  id: number
  nome: string
  slug: string
  descricao: string
  ativo: boolean
}

export type Foto = {
  id: number
  album: number
  imagem: string
  miniatura: string
  imagem_media: string
  legenda: string
  alt: string
  largura: number | null
  altura: number | null
  ordem: number
}

export type GaleriaCategoria = {
  id: number
  nome: string
  slug: string
}

export type Album = {
  id: number
  titulo: string
  slug: string
  descricao: string
  data_evento: string | null
  capa: string | null
  categoria: number | null
  publicado: boolean
  ordem: number
  total_fotos: number
  fotos: Foto[]
  data_criacao: string
  data_atualizacao: string
}

export type Post = {
  id: number
  titulo: string
  slug: string
  resumo: string
  conteudo: string
  conteudo_json: JSONContent | null
  imagem_capa: string | null
  autor: number
  autor_nome: string
  categoria: number | null
  categoria_nome: string | null
  destaque: boolean
  status: string
  status_display: string
  tempo_leitura_minutos: number | null
  data_criacao: string
  data_atualizacao: string
  data_publicacao: string | null
}
