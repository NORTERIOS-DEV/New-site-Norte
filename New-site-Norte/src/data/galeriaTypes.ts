export type Foto = {
  id: number
  imagem: string
  miniatura: string
  imagem_media: string
  legenda: string
  alt: string
  largura: number | null
  altura: number | null
  ordem: number
}

export type Categoria = {
  id: number
  nome: string
  slug: string
}

export type AlbumListItem = {
  id: number
  titulo: string
  slug: string
  data_evento: string | null
  capa: string | null
  categoria: Categoria | null
  total_fotos: number
}

export type AlbumDetail = AlbumListItem & {
  descricao: string
}
