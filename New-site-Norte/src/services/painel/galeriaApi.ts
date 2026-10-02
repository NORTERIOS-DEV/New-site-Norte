import type { Paginated } from '../../data/blogTypes'
import type { Album, Foto, GaleriaCategoria } from '../../data/painel/painelTypes'
import { painelFetchJson } from './httpClient'

const BASE = '/galeria'

export function listAlbuns(page = 1): Promise<Paginated<Album>> {
  return painelFetchJson(`${BASE}/albuns/?page=${page}`)
}

export function getAlbum(id: number): Promise<Album> {
  return painelFetchJson(`${BASE}/albuns/${id}/`)
}

export type AlbumInput = {
  titulo: string
  slug?: string
  descricao?: string
  data_evento?: string | null
  categoria?: number | null
  publicado: boolean
}

function buildAlbumFormData(data: AlbumInput, capa?: File | null): FormData {
  const fd = new FormData()
  fd.append('titulo', data.titulo)
  if (data.slug) fd.append('slug', data.slug)
  fd.append('descricao', data.descricao ?? '')
  if (data.data_evento) fd.append('data_evento', data.data_evento)
  if (data.categoria) fd.append('categoria', String(data.categoria))
  fd.append('publicado', String(data.publicado))
  if (capa) fd.append('capa', capa)
  return fd
}

export function createAlbum(data: AlbumInput, capa?: File | null): Promise<Album> {
  return painelFetchJson(`${BASE}/albuns/`, { method: 'POST', body: buildAlbumFormData(data, capa) })
}

export function updateAlbum(id: number, data: AlbumInput, capa?: File | null): Promise<Album> {
  return painelFetchJson(`${BASE}/albuns/${id}/`, { method: 'PATCH', body: buildAlbumFormData(data, capa) })
}

export function deleteAlbum(id: number): Promise<void> {
  return painelFetchJson(`${BASE}/albuns/${id}/`, { method: 'DELETE' })
}

export function publicarAlbum(id: number): Promise<Album> {
  return painelFetchJson(`${BASE}/albuns/${id}/publicar/`, { method: 'POST' })
}

export function despublicarAlbum(id: number): Promise<Album> {
  return painelFetchJson(`${BASE}/albuns/${id}/despublicar/`, { method: 'POST' })
}

export type UploadFotosResult = {
  criadas: Foto[]
  erros: { arquivo: string; erro: string }[]
}

export function uploadFotos(
  albumId: number,
  files: File[],
  metadata?: { legenda?: string; alt?: string },
): Promise<UploadFotosResult> {
  const fd = new FormData()
  files.forEach((file) => fd.append('fotos', file))
  if (metadata?.legenda) fd.append('legenda', metadata.legenda)
  if (metadata?.alt) fd.append('alt', metadata.alt)
  return painelFetchJson(`${BASE}/albuns/${albumId}/fotos/upload/`, { method: 'POST', body: fd })
}

export function reordenarFotos(albumId: number, ordemIds: number[]): Promise<Foto[]> {
  return painelFetchJson(`${BASE}/albuns/${albumId}/fotos/reordenar/`, {
    method: 'POST',
    body: { ordem: ordemIds },
  })
}

export function updateFoto(id: number, data: { legenda?: string; alt?: string }, imagem?: File | null): Promise<Foto> {
  if (imagem) {
    const fd = new FormData()
    if (data.legenda !== undefined) fd.append('legenda', data.legenda)
    if (data.alt !== undefined) fd.append('alt', data.alt)
    fd.append('imagem', imagem)
    return painelFetchJson(`${BASE}/fotos/${id}/`, { method: 'PATCH', body: fd })
  }
  return painelFetchJson(`${BASE}/fotos/${id}/`, { method: 'PATCH', body: data })
}

export function deleteFoto(id: number): Promise<void> {
  return painelFetchJson(`${BASE}/fotos/${id}/`, { method: 'DELETE' })
}

export function listGaleriaCategorias(): Promise<GaleriaCategoria[]> {
  return painelFetchJson(`${BASE}/categorias/`)
}
