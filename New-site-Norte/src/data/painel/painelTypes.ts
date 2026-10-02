import type { JSONContent } from '@tiptap/core'

export type Autor = {
  id: number
  nome: string
  nome_exibicao: string
  foto: string | null
  mini_bio: string
  cargo: string
  formacao_especialidade: string
  instagram: string
  linkedin: string
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
  /** Estado derivado para exibição: "agendado" quando status=publicado com
   * data_publicacao futura - nunca persistido como valor de `status` (ver
   * blog/models.py Post.status_efetivo). */
  status_efetivo: string
  tempo_leitura_minutos: number | null
  data_criacao: string
  data_atualizacao: string
  data_publicacao: string | null
  meta_title: string
  meta_description: string
  og_image: string | null
}
