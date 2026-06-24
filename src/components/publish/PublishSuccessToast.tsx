'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  isVisible: boolean
}

export default function PublishSuccessToast({ isVisible }: Props) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-[300] bg-white rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 500, damping: 15 }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.div>
          <div>
            <p className="text-sm font-semibold text-gray-800">发布成功!</p>
            <p className="text-xs text-gray-400">即将返回首页...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
