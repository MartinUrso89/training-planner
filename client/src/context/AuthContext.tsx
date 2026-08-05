import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthUser } from '../services/auth'
import { fetchMe } from '../services/auth'

const STORAGE_KEY_USER = 'user'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isCargando: boolean
  login: (accessToken: string, refreshToken: string, user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }): ReactNode {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)
  const [isCargando, setIsCargando] = useState(true)

  useEffect(() => {
    let active = true

    async function validarSesion() {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setUser(null)
        setIsCargando(false)
        return
      }

      try {
        const userData = await fetchMe()
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData))
        if (active) setUser(userData)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem(STORAGE_KEY_USER)
        if (active) setUser(null)
      } finally {
        if (active) setIsCargando(false)
      }
    }

    validarSesion()
    return () => {
      active = false
    }
  }, [])

  const login = useCallback((accessToken: string, refreshToken: string, usuario: AuthUser) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(usuario))
    setUser(usuario)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem(STORAGE_KEY_USER)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: user !== null, isCargando, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
