import { create } from 'zustand'
import type { User } from '@shared/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  verifyToken: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error?.message || 'Login failed')
      }

      set({
        user: data.data.user,
        token: data.data.token,
        isAuthenticated: true,
      })
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  register: async (username: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error?.message || 'Registration failed')
      }

      set({
        user: data.data.user,
        token: data.data.token,
        isAuthenticated: true,
      })
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  },

  verifyToken: async () => {
    const { token } = get()
    if (!token) return

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error('Token verification failed')
      }

      set({
        user: data.data.user,
        token,
        isAuthenticated: true,
      })
    } catch (error) {
      console.error('Token verification error:', error)
      get().logout()
    }
  },
}))
export const getAuthenticatedFetch = (token: string) => {
  return async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    })
  }
}