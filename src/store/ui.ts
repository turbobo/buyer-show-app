import { create } from 'zustand'

interface ToastItem {
  id: string
  type: 'success' | 'error' | 'info' | 'loading'
  message: string
}

interface UIState {
  toasts: ToastItem[]
  modal: {
    open: boolean
    title: string
    description: string
    confirmText: string
    confirmDanger: boolean
    onConfirm: () => void
  } | null
  addToast: (type: ToastItem['type'], message: string) => void
  removeToast: (id: string) => void
  openModal: (config: Omit<NonNullable<UIState['modal']>, 'open'>) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  modal: null,

  addToast: (type, message) => {
    const id = Math.random().toString(36).slice(2)
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }))

    if (type !== 'loading') {
      const duration = type === 'error' ? 3000 : 2000
      setTimeout(() => get().removeToast(id), duration)
    }
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },

  openModal: (config) => {
    set({ modal: { ...config, open: true } })
  },

  closeModal: () => {
    set({ modal: null })
  },
}))
