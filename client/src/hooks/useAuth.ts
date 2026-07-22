import { useState, useEffect, useCallback } from 'react'
import type { AuthUser } from '../services/auth'
import { fetchMe } from '../services/auth'

const STORAGE_KEY = 'user'

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as AuthUser : null
  } catch {
    return null
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const userData = await fetchMe()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
      setUser(userData)
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem(STORAGE_KEY)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  return { user, loading, refresh, logout }
}
