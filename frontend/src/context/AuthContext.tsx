import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authService from '../services/authService'
import type { UserLogin, UserRegister, UserResponse } from '../types/user'
import { AUTH_STORAGE_KEY } from '../utils/authStorage'

type AuthContextValue = {
  user: UserResponse | null
  isAuthenticated: boolean
  login: (credentials: UserLogin) => Promise<UserResponse>
  register: (payload: UserRegister) => Promise<UserResponse>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredUser(): UserResponse | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as UserResponse
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(() => readStoredUser())

  const persistUser = useCallback((next: UserResponse | null) => {
    setUser(next)
    if (next) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next))
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }, [])

  const login = useCallback(
    async (credentials: UserLogin) => {
      const loggedIn = await authService.login(credentials)
      persistUser(loggedIn)
      return loggedIn
    },
    [persistUser],
  )

  const register = useCallback(async (payload: UserRegister) => {
    return authService.register(payload)
  }, [])

  const logout = useCallback(() => {
    persistUser(null)
  }, [persistUser])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
    }),
    [user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
