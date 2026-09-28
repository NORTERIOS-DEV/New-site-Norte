import type { JSONContent } from '@tiptap/core'
import type { Paginated } from '../../data/blogTypes'
import type { Post } from '../../data/painel/painelTypes'
import { painelFetchJson } from './httpClient'

export type PostFilters = {
  titulo?: string
  categoria?: number
  autor?: number
  status?: string
  data_de?: string
  data_ate?: string
  ordering?: string
  page?: number
}

export function listPosts(filters: PostFilters): Promise<Paginated<Post>> {
  const params = new URLSearchParams()
  if (filters.titulo) params.set('titulo', filters.titulo)
  if (filters.categoria) params.set('categoria', String(filters.categoria))
  if (filters.autor) params.set('autor', String(filters.autor))
  if (filters.status) params.set('status', filters.status)
  if (filters.data_de) params.set('data_de', filters.data_de)
  if (filters.data_ate) params.set('data_ate', filters.data_ate)
  if (filters.ordering) params.set('ordering', filters.ordering)
  if (filters.page) params.set('page', String(filters.page))
  const qs = params.toString()
  return painelFetchJson(`/posts/${qs ? `?${qs}` : ''}`)
}

export function getPost(id: number): Promise<Post> {
  return painelFetchJson(`/posts/${id}/`)
}

export type PostInput = {
  titulo: string
  slug?: string
  resumo: string
  conteudo_json: JSONContent | null
  autor: number
  categoria?: number | null
  destaque?: boolean
  status: string
  data_publicacao?: string | null
  tempo_leitura_minutos?: number | null
}

function buildFormData(data: PostInput, imagemCapa?: File | null): FormData {
  const fd = new FormData()
  fd.append('titulo', data.titulo)
  if (data.slug) fd.append('slug', data.slug)
  fd.append('resumo', data.resumo)
  fd.append('conteudo_json', JSON.stringify(data.conteudo_json ?? null))
  fd.append('autor', String(data.autor))
  if (data.categoria) fd.append('categoria', String(data.categoria))
  fd.append('destaque', String(Boolean(data.destaque)))
  fd.append('status', data.status)
  if (data.data_publicacao) fd.append('data_publicacao', data.data_publicacao)
  if (data.tempo_leitura_minutos) fd.append('tempo_leitura_minutos', String(data.tempo_leitura_minutos))
  if (imagemCapa) fd.append('imagem_capa', imagemCapa)
  return fd
}

export function createPost(data: PostInput, imagemCapa?: File | null): Promise<Post> {
  return painelFetchJson('/posts/', { method: 'POST', body: buildFormData(data, imagemCapa) })
}

export function updatePost(id: number, data: PostInput, imagemCapa?: File | null): Promise<Post> {
  return painelFetchJson(`/posts/${id}/`, { method: 'PATCH', body: buildFormData(data, imagemCapa) })
}

export function deletePost(id: number): Promise<void> {
  return painelFetchJson(`/posts/${id}/`, { method: 'DELETE' })
}

export function publicarPost(id: number): Promise<Post> {
  return painelFetchJson(`/posts/${id}/publicar/`, { method: 'POST' })
}

export function despublicarPost(id: number): Promise<Post> {
  return painelFetchJson(`/posts/${id}/despublicar/`, { method: 'POST' })
}
