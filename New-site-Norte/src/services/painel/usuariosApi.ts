import { painelFetchJson, PainelApiError } from './httpClient'
import type { PainelUser } from './authApi'
import type { Paginated } from '../../data/blogTypes'

export const listUsuarios = (params: URLSearchParams) => painelFetchJson<Paginated<PainelUser>>(`/usuarios/?${params}`)
export const getUsuario = (id: number) => painelFetchJson<PainelUser>(`/usuarios/${id}/`)
export const saveUsuario = (id: number | null, body: Record<string, unknown>) => painelFetchJson<PainelUser>(id ? `/usuarios/${id}/` : '/usuarios/', { method: id ? 'PATCH' : 'POST', body })
export const deleteUsuario = (id: number) => painelFetchJson<void>(`/usuarios/${id}/`, { method: 'DELETE' })
export function apiError(error: unknown): string {
  if (error instanceof PainelApiError && error.body && typeof error.body === 'object') {
    return Object.entries(error.body).map(([key, value]) => `${key === 'detail' ? '' : `${key}: `}${Array.isArray(value) ? value.join(' ') : value}`).join('\n')
  }
  return 'Não foi possível concluir. Tente novamente.'
}
