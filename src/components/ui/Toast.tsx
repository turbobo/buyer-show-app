'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/ui'

export default function Toast() {
  const toasts = useUIStore((s) => s.toasts)

  const icons = {
    success: <span className="text-emerald-500">✓</span>,
    error: <span className="text-red-500">✕</span>,
    info: <span className="text-gray-400">ℹ</span>,
    loading: (
      <motion.span
        className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    ),
  }

  return (
    <div className="fixed top-[60px] left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-800/90 backdrop-blur text-white px-4 py-2 rounded-full text-sm max-w-[320px] flex items-center gap-2 shadow-lg pointer-events-auto"
          >
            {icons[toast.type]}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
