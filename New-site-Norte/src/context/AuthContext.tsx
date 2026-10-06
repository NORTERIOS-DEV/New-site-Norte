import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
  refreshAccessToken,
  type PainelUser,
} from '../services/painel/authApi'
import { tokenStore } from '../services/painel/tokenStore'
import { useQueryClient } from '@tanstack/react-query'

type AuthContextValue = {
  user: PainelUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  hasPerm: (perm: string) => boolean
  reloadUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<PainelUser | null>(null)
  const currentUser = useRef<PainelUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(async () => {
    const access = tokenStore.getAccessToken()
    try {
      const nextUser = await getMe()
      if (access === tokenStore.getAccessToken()) {
        if (currentUser.current && (currentUser.current.id !== nextUser.id || currentUser.current.tipo !== nextUser.tipo)) {
          await queryClient.cancelQueries()
          queryClient.clear()
        }
        currentUser.current = nextUser
        setUser(nextUser)
      }
    } catch {
      setUser(null)
    }
  }, [queryClient])

  useEffect(() => tokenStore.subscribe(() => {
    if (!tokenStore.getRefreshToken()) {
      currentUser.current = null
      setUser(null)
      void queryClient.cancelQueries()
      queryClient.clear()
    }
  }), [queryClient])

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
      await queryClient.cancelQueries()
      queryClient.clear()
      await apiLogin(username, password)
      await loadUser()
    },
    [loadUser, queryClient],
  )

  const logout = useCallback(() => {
    apiLogout()
    void queryClient.cancelQueries()
    queryClient.clear()
    setUser(null)
  }, [queryClient])

  const hasPerm = useCallback((perm: string) => Boolean(user?.permissions.includes(perm)), [user])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), isLoading, login, logout, hasPerm, reloadUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
