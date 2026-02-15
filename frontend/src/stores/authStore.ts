import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { API_BASE_URL } from '../utils/constants'

export interface User {
  user_id: string
  username: string
  display_name: string
  role: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.detail || '登录失败')
        }
        const data = await res.json()
        set({
          token: data.token,
          user: data.user,
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false })
      },

      checkAuth: async () => {
        const { token } = get()
        if (!token) {
          set({ isAuthenticated: false })
          return
        }
        try {
          const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!res.ok) throw new Error()
          const user = await res.json()
          set({ user, isAuthenticated: true })
        } catch {
          set({ token: null, user: null, isAuthenticated: false })
        }
      },
    }),
    {
      name: 'taishi-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
