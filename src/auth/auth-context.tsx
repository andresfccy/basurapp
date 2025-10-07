import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { apiService } from '../services/api'

export type Role = 'basic' | 'admin' | 'collector'

export type AuthenticatedUser = {
  id: string
  email: string
  role: Role
  displayName: string
  firstName: string
  lastName: string
}

type LoginPayload = {
  email: string
  password: string
}

type AuthContextValue = {
  user: AuthenticatedUser | null
  login: (payload: LoginPayload) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'basurapp-auth'

function getStoredUser(): AuthenticatedUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthenticatedUser
  } catch (error) {
    console.warn('No se pudo leer el usuario almacenado', error)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(() => getStoredUser())

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  const login = useCallback(async (payload: LoginPayload) => {
    try {
      const response = await apiService.login({
        email: payload.email,
        password: payload.password,
      })

      const authenticatedUser: AuthenticatedUser = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        role: response.user.role as Role,
        displayName: `${response.user.firstName} ${response.user.lastName}`,
      }

      setUser(authenticatedUser)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al iniciar sesión',
      }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiService.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

export function getRoleLabel(role: Role) {
  switch (role) {
    case 'basic':
      return 'Básico'
    case 'admin':
      return 'Administrador'
    case 'collector':
      return 'Recolector'
    default:
      return 'Sin rol'
  }
}
