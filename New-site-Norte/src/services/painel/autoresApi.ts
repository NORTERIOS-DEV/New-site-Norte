import type { Autor } from '../../data/painel/painelTypes'
import { painelFetchJson } from './httpClient'

export function listAutores(): Promise<Autor[]> {
  return painelFetchJson('/autores/')
}

/** Sempre FormData: Autor tem upload de foto (ImageField), então o create/edit
 * precisa de multipart mesmo quando nenhum arquivo novo é enviado. */
export function createAutor(data: FormData): Promise<Autor> {
  return painelFetchJson('/autores/', { method: 'POST', body: data })
}

export function updateAutor(id: number, data: FormData): Promise<Autor> {
  return painelFetchJson(`/autores/${id}/`, { method: 'PATCH', body: data })
}

export function deleteAutor(id: number): Promise<void> {
  return painelFetchJson(`/autores/${id}/`, { method: 'DELETE' })
}
