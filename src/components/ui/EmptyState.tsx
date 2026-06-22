'use client'

import { motion } from 'framer-motion'

interface Props {
  icon: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: Props) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h2 className="text-xl font-bold text-gray-700 text-center">{title}</h2>
      {description && (
        <p className="text-sm text-gray-400 text-center mt-2 max-w-[280px]">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-6 py-2.5 rounded-full bg-[#FF6B35] text-white font-medium hover:bg-[#FF5A1F] transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  )
}
