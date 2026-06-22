'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/ui'

export default function Modal() {
  const modal = useUIStore((s) => s.modal)
  const closeModal = useUIStore((s) => s.closeModal)

  if (!modal?.open) return null

  const handleConfirm = () => {
    modal.onConfirm()
    closeModal()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={closeModal}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="bg-white rounded-[24px] p-6 max-w-[320px] w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold text-center text-gray-800">
            {modal.title}
          </h2>
          <p className="text-sm text-gray-500 text-center mt-2">
            {modal.description}
          </p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={closeModal}
              className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-2.5 rounded-full text-white font-medium transition-colors ${
                modal.confirmDanger
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-[#FF6B35] hover:bg-[#FF5A1F]'
              }`}
            >
              {modal.confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
