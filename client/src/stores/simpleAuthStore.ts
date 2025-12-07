import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  verifyToken: () => Promise<void>
  initialize: () => Promise<void>
}

// Helper functions for localStorage
const STORAGE_KEY = 'auth_token'
const USER_STORAGE_KEY = 'auth_user'

const saveToStorage = (token: string | null, user: User | null) => {
  if (token) {
    localStorage.setItem(STORAGE_KEY, token)
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_STORAGE_KEY)
  }
}

const loadFromStorage = (): { token: string | null; user: User | null } => {
  const token = localStorage.getItem(STORAGE_KEY)
  const userStr = localStorage.getItem(USER_STORAGE_KEY)
  let user: User | null = null
  if (userStr) {
    try {
      user = JSON.parse(userStr)
    } catch (e) {
      console.error('Failed to parse user from storage:', e)
    }
  }
  return { token, user }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,

  initialize: async () => {
    try {
      const { token, user } = loadFromStorage()
      if (token && user) {
        // Set initial state optimistically
        set({ token, user, isAuthenticated: true })
        // Verify token with server (silently, don't throw)
        await get().verifyToken()
      }
      set({ isInitialized: true })
    } catch (error) {
      console.error('Failed to initialize auth store:', error)
      // Clear any invalid data
      saveToStorage(null, null)
      // Ensure we still mark as initialized even if there's an error
      set({ isInitialized: true, user: null, token: null, isAuthenticated: false })
    }
  },

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

      const { user, token } = data.data
      saveToStorage(token, user)
      set({
        user,
        token,
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

      const { user, token } = data.data
      saveToStorage(token, user)
      set({
        user,
        token,
        isAuthenticated: true,
      })
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  },

  logout: () => {
    saveToStorage(null, null)
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  },

  verifyToken: async () => {
    const { token } = get()
    if (!token) {
      // Try to load from storage
      const stored = loadFromStorage()
      if (!stored.token) return
      set({ token: stored.token })
    }

    const currentToken = get().token
    if (!currentToken) return

    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      })

      const data = await response.json()

      if (!data.success) {
        // Clear invalid token
        console.warn('Token verification failed:', data.error?.message)
        saveToStorage(null, null)
        set({ user: null, token: null, isAuthenticated: false })
        return
      }

      const user = data.data.user
      saveToStorage(currentToken, user)
      set({
        user,
        token: currentToken,
        isAuthenticated: true,
      })
    } catch (error) {
      console.error('Token verification error:', error)
      saveToStorage(null, null)
      set({ user: null, token: null, isAuthenticated: false })
    }
  },
}))