import { create } from 'zustand'
import type { User } from '@/types'
import { MOCK_USERS } from '@/lib/mock-data'

interface UserState {
  user: User | null
  isLoggedIn: boolean
  /** 应用启动时的会话恢复是否完成。AuthProvider 在 getSession 后置 true */
  authReady: boolean
  setUser: (user: User | null) => void
  setAuthReady: (ready: boolean) => void
  logout: () => void
  loginMock: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoggedIn: false,
  authReady: false,
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  setAuthReady: (ready) => set({ authReady: ready }),
  logout: () => set({ user: null, isLoggedIn: false }),
  loginMock: () => set({ user: MOCK_USERS[0], isLoggedIn: true }),
}))
