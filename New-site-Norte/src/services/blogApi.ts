import type { Categoria, Paginated, PostDetail, PostListItem } from '../data/blogTypes'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api'

export async function getPosts(params?: {
  page?: number
  categoria?: string
  destaque?: boolean
  search?: string
  ordering?: 'data_publicacao' | '-data_publicacao'
}): Promise<Paginated<PostListItem>> {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.categoria) query.set('categoria', params.categoria)
  if (params?.destaque) query.set('destaque', 'true')
  if (params?.search) query.set('search', params.search)
  if (params?.ordering) query.set('ordering', params.ordering)
  const qs = query.toString()

  const res = await fetch(`${API_BASE_URL}/posts/${qs ? `?${qs}` : ''}`)
  if (!res.ok) throw new Error(`Falha ao carregar posts (${res.status})`)
  return res.json()
}

export async function getCategorias(): Promise<Categoria[]> {
  const res = await fetch(`${API_BASE_URL}/categorias/`)
  if (!res.ok) throw new Error(`Falha ao carregar categorias (${res.status})`)
  return res.json()
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const res = await fetch(`${API_BASE_URL}/posts/${slug}/`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Falha ao carregar post (${res.status})`)
  return res.json()
}
