import { tokenStore } from './tokenStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8001/api'
const AUTH_BASE_URL = `${API_BASE_URL}/painel/auth`

export type PainelUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  groups: string[]
  permissions: string[]
  nome_completo: string
  telefone: string
  cargo: string
  tipo: 'gerente' | 'autor' | 'comum'
  is_active: boolean
  autor: number | null
}

export async function login(username: string, password: string): Promise<void> {
  const res = await fetch(`${AUTH_BASE_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) throw new Error('Usuário ou senha inválidos.')
  const data = await res.json()
  tokenStore.setTokens({ access: data.access, refresh: data.refresh })
}

let refreshPromise: Promise<boolean> | null = null

/** Deduplicado: várias chamadas simultâneas (ex.: 401 em paralelo) reaproveitam a mesma promise. */
export function refreshAccessToken(): Promise<boolean> {
  const refresh = tokenStore.getRefreshToken()
  if (!refresh) return Promise.resolve(false)

  if (!refreshPromise) {
    refreshPromise = fetch(`${AUTH_BASE_URL}/login/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
      .then(async (res) => {
        if (!res.ok) return false
        const data = await res.json()
        if (tokenStore.getRefreshToken() !== refresh) return false
        tokenStore.setTokens({ access: data.access, refresh: data.refresh ?? refresh })
        return true
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

export async function getMe(): Promise<PainelUser> {
  const res = await fetch(`${AUTH_BASE_URL}/me/`, {
    headers: { Authorization: `Bearer ${tokenStore.getAccessToken()}` },
  })
  if (!res.ok) throw new Error('Falha ao carregar usuário logado.')
  return res.json()
}

export function logout(): void {
  tokenStore.clear()
}
