import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Role = 'basic' | 'admin' | 'collector'

export type AuthenticatedUser = {
  username: string
  role: Role
  displayName: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

type LoginPayload = {
  username: string
  password: string
}

type AuthContextValue = {
  user: AuthenticatedUser | null
  login: (payload: LoginPayload) => { success: boolean; message?: string }
  logout: () => void
}

type MockUser = AuthenticatedUser & {
  password: string
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'basurapp-auth'

const mockUsers: MockUser[] = [
  {
    username: 'ciudadano',
    password: 'basico123',
    role: 'basic',
    displayName: 'Andrea Morales',
    firstName: 'Andrea',
    lastName: 'Morales',
    email: 'andrea.morales@example.com',
    phone: '+57 300 123 4567',
  },
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    displayName: 'Santiago Ruiz',
    firstName: 'Santiago',
    lastName: 'Ruiz',
    email: 'santiago.ruiz@basurapp.com',
    phone: '+57 311 987 6543',
  },
  {
    username: 'recolector',
    password: 'reco123',
    role: 'collector',
    displayName: 'Laura García',
    firstName: 'Laura',
    lastName: 'García',
    email: 'laura.garcia@basurapp.com',
    phone: '+57 312 555 0199',
  },
]

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

  const login = useCallback((payload: LoginPayload) => {
    const found = mockUsers.find(
      (candidate) =>
        candidate.username.toLowerCase() === payload.username.trim().toLowerCase() &&
        candidate.password === payload.password,
    )

    if (!found) {
      return { success: false, message: 'Usuario o contraseña incorrectos' }
    }

    const { password: _password, ...authenticated } = found
    void _password
    setUser(authenticated)

    return { success: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
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

export const authPresets = mockUsers.map(({ password, ...rest }) => ({ ...rest, password }))
