import { refreshAccessToken } from './authApi'
import { tokenStore } from './tokenStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8001/api'
const PAINEL_BASE_URL = `${API_BASE_URL}/painel`

export class PainelApiError extends Error {
  status: number
  /** Corpo JSON do erro (ex.: {"slug": ["Já existe..."]}) - usado para setError por campo nos formulários. */
  body: unknown

  constructor(status: number, body: unknown) {
    super(`Falha na requisição (${status})`)
    this.status = status
    this.body = body
  }
}

type PainelFetchOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | null
}

function isPlainJsonBody(body: unknown): body is Record<string, unknown> {
  return body !== null && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)
}

async function doFetch(path: string, options: PainelFetchOptions): Promise<Response> {
  const { body, headers, ...rest } = options
  const finalHeaders = new Headers(headers)
  const token = tokenStore.getAccessToken()
  if (token) finalHeaders.set('Authorization', `Bearer ${token}`)

  let finalBody: BodyInit | null | undefined
  if (isPlainJsonBody(body)) {
    finalHeaders.set('Content-Type', 'application/json')
    finalBody = JSON.stringify(body)
  } else {
    finalBody = body
  }

  return fetch(`${PAINEL_BASE_URL}${path}`, { ...rest, headers: finalHeaders, body: finalBody })
}

/** fetch() autenticado: injeta o Bearer token e tenta um refresh (uma vez) em 401 antes de desistir. */
export async function painelFetch(path: string, options: PainelFetchOptions = {}): Promise<Response> {
  let res = await doFetch(path, options)

  if (res.status === 401 && tokenStore.getRefreshToken()) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      res = await doFetch(path, options)
    } else {
      tokenStore.clear()
    }
  }

  return res
}

export async function painelFetchJson<T>(path: string, options?: PainelFetchOptions): Promise<T> {
  const res = await painelFetch(path, options)
  if (!res.ok) {
    let body: unknown = null
    try {
      body = await res.json()
    } catch {
      // resposta sem corpo JSON (ex.: 401 puro)
    }
    throw new PainelApiError(res.status, body)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}
