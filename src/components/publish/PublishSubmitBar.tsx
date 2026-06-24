'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  title: string
  content: string
  submitting: boolean
  onSubmit: () => void
}

export default function PublishSubmitBar({ title, content, submitting, onSubmit }: Props) {
  const trimmedTitle = title.trim()
  const trimmedContent = content.trim()
  const isFormValid = trimmedTitle.length >= 2 && trimmedContent.length >= 10

  const hint = !trimmedTitle
    ? '请填写标题'
    : trimmedTitle.length < 2
      ? `标题还需 ${2 - trimmedTitle.length} 字`
      : !trimmedContent
        ? '请填写使用体验'
        : trimmedContent.length < 10
          ? `使用体验还需 ${10 - trimmedContent.length} 字`
          : null

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-5 pb-8 bg-gradient-to-t from-warm-50 via-warm-50 to-transparent z-30">
      <AnimatePresence>
        {hint && (
          <motion.p
            key={hint}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="mb-2 text-center text-xs text-coral-500"
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
      <motion.button
        whileTap={{ scale: isFormValid ? 0.96 : 1 }}
        onClick={onSubmit}
        disabled={submitting}
        aria-disabled={!isFormValid || submitting}
        className={`w-full py-3.5 rounded-2xl text-base font-semibold transition-all duration-300 shadow-lg ${
          !isFormValid
            ? 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
            : submitting
              ? 'bg-coral-300 text-white shadow-coral-200/30 cursor-wait'
              : 'bg-gradient-to-r from-coral-500 to-coral-400 text-white shadow-coral-300/40 hover:shadow-coral-300/60'
        }`}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
            发布中...
          </span>
        ) : (
          '发布买家秀'
        )}
      </motion.button>
    </div>
  )
}
