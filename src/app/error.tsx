'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface Props {
  error: Error
  reset: () => void
}

export default function Error({ error, reset }: Props) {
  const message =
    error.message.length > 100
      ? `${error.message.slice(0, 100)}...`
      : error.message

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-warm-50 px-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center text-center"
      >
        <span className="text-6xl block mb-4">📡</span>
        <h1 className="text-h1 text-gray-800">出了点问题</h1>
        <p className="text-caption text-gray-400 mt-2 max-w-[320px] break-words">
          {message}
        </p>
        <div className="flex items-center gap-3 mt-6">
          <button onClick={reset} className="btn-primary text-sm">
            重试
          </button>
          <Link href="/" className="btn-secondary text-sm">
            返回首页
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
