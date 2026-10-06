const REFRESH_KEY = 'painel_refresh_token'

type Listener = () => void

function readStoredRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY)
  } catch {
    // localStorage indisponível (ex.: aba privada) - só não sobrevive ao reload
    return null
  }
}

let accessToken: string | null = null
let refreshToken: string | null = readStoredRefreshToken()
const listeners = new Set<Listener>()

function notify() {
  listeners.forEach((listener) => listener())
}

export const tokenStore = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => refreshToken,

  setTokens(next: { access: string; refresh: string }) {
    accessToken = next.access
    refreshToken = next.refresh
    try {
      localStorage.setItem(REFRESH_KEY, next.refresh)
    } catch {
      // ver comentário acima
    }
    notify()
  },

  clear() {
    accessToken = null
    refreshToken = null
    try {
      localStorage.removeItem(REFRESH_KEY)
    } catch {
      // ver comentário acima
    }
    notify()
  },

  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
}
