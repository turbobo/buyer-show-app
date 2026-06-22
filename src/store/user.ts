import { create } from 'zustand'
import type { User } from '@/types'
import { MOCK_USERS } from '@/lib/mock-data'

interface UserState {
  user: User | null
  isLoggedIn: boolean
  setUser: (user: User | null) => void
  logout: () => void
  loginMock: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoggedIn: false,
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  logout: () => set({ user: null, isLoggedIn: false }),
  loginMock: () => set({ user: MOCK_USERS[0], isLoggedIn: true }),
}))
