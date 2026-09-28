import type { Paginated } from '../data/blogTypes'
import type { AlbumDetail, AlbumListItem, Categoria, Foto } from '../data/galeriaTypes'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'

export async function getAlbuns(params?: {
  page?: number
  categoria?: string
}): Promise<Paginated<AlbumListItem>> {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.categoria) query.set('categoria', params.categoria)
  const qs = query.toString()

  const res = await fetch(`${API_BASE_URL}/galeria/albuns/${qs ? `?${qs}` : ''}`)
  if (!res.ok) throw new Error(`Falha ao carregar álbuns (${res.status})`)
  return res.json()
}

export async function getGaleriaCategorias(): Promise<Categoria[]> {
  const res = await fetch(`${API_BASE_URL}/galeria/categorias/`)
  if (!res.ok) throw new Error(`Falha ao carregar categorias (${res.status})`)
  return res.json()
}

export async function getAlbumBySlug(slug: string): Promise<AlbumDetail | null> {
  const res = await fetch(`${API_BASE_URL}/galeria/albuns/${slug}/`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Falha ao carregar álbum (${res.status})`)
  return res.json()
}

export async function getAlbumFotos(slug: string, page = 1): Promise<Paginated<Foto>> {
  const res = await fetch(`${API_BASE_URL}/galeria/albuns/${slug}/fotos/?page=${page}`)
  if (!res.ok) throw new Error(`Falha ao carregar fotos do álbum (${res.status})`)
  return res.json()
}
