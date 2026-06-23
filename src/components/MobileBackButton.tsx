'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { smartBack } from '@/lib/nav-helpers'

/**
 * 移动端悬浮返回按钮 —— 固定在左上角，仅在 md 以下显示。
 * 用于详情页等需要返回的场景，替代 TopNav 中 PC 端的返回箭头。
 */
export default function MobileBackButton({ fallback = '/' }: { fallback?: string }) {
  const router = useRouter()

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15, duration: 0.2 }}
      onClick={() => smartBack(router, fallback)}
      className="md:hidden fixed top-3 left-3 z-50 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      aria-label="返回上一页"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </motion.button>
  )
}
