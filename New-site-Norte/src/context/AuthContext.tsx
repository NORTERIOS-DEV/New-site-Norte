import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
  refreshAccessToken,
  type PainelUser,
} from '../services/painel/authApi'
import { tokenStore } from '../services/painel/tokenStore'

type AuthContextValue = {
  user: PainelUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  hasPerm: (perm: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PainelUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(async () => {
    try {
      setUser(await getMe())
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (tokenStore.getRefreshToken()) {
        const ok = await refreshAccessToken()
        if (cancelled) return
        if (ok) {
          await loadUser()
        } else {
          tokenStore.clear()
        }
      }
      if (!cancelled) setIsLoading(false)
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [loadUser])

  const login = useCallback(
    async (username: string, password: string) => {
      await apiLogin(username, password)
      await loadUser()
    },
    [loadUser],
  )

  const logout = useCallback(() => {
    apiLogout()
    setUser(null)
  }, [])

  const hasPerm = useCallback((perm: string) => Boolean(user?.permissions.includes(perm)), [user])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), isLoading, login, logout, hasPerm }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
