import type { Categoria } from '../../data/painel/painelTypes'
import { painelFetchJson } from './httpClient'

export type CategoriaInput = {
  nome: string
  slug?: string
  descricao?: string
  ativo: boolean
}

export function listCategorias(): Promise<Categoria[]> {
  return painelFetchJson('/categorias/')
}

export function createCategoria(data: CategoriaInput): Promise<Categoria> {
  return painelFetchJson('/categorias/', { method: 'POST', body: data })
}

export function updateCategoria(id: number, data: CategoriaInput): Promise<Categoria> {
  return painelFetchJson(`/categorias/${id}/`, { method: 'PATCH', body: data })
}

export function deleteCategoria(id: number): Promise<void> {
  return painelFetchJson(`/categorias/${id}/`, { method: 'DELETE' })
}
