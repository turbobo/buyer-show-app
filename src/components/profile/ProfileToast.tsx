'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  message: string | null
}

export default function ProfileToast({ message }: Props) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed top-14 left-1/2 -translate-x-1/2 z-[200] bg-gray-800 text-white px-5 py-2.5 rounded-xl shadow-xl text-sm font-medium whitespace-nowrap"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
