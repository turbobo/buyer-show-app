'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/store/ui'

export default function LoginSheet() {
  const router = useRouter()
  const { loginSheet, closeLoginSheet } = useUIStore((s) => ({
    loginSheet: s.loginSheet,
    closeLoginSheet: s.closeLoginSheet,
  }))

  const handleGoLogin = () => {
    closeLoginSheet()
    router.push('/login')
  }

  return (
    <AnimatePresence>
      {loginSheet.open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={closeLoginSheet}
          />

          {/* Mobile: bottom sheet / Desktop: centered modal */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="
              fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-modal p-6 safe-bottom z-[70]
              md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[400px] md:rounded-modal md:shadow-modal
            "
          >
            {/* Drag indicator (mobile only) */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6 md:hidden" />

            {/* Logo + Content */}
            <div className="flex flex-col items-center mb-6">
              <img src="/logo.png" alt="买家说" width={48} height={48} className="rounded-2xl mb-3" />
              <h3 className="text-h2 text-gray-800">登录后{loginSheet.reason}</h3>
              <p className="text-caption text-gray-400 mt-1">
                注册/登录后可点赞、评论、发布内容
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleGoLogin}
                className="w-full btn-primary text-body py-3.5"
                aria-label="邮箱登录"
              >
                邮箱登录
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleGoLogin}
                className="w-full btn-secondary text-body py-3.5"
                aria-label="注册新账号"
              >
                注册新账号
              </motion.button>
            </div>

            {/* Close */}
            <button
              onClick={closeLoginSheet}
              className="w-full text-caption text-gray-400 mt-4 py-2"
              aria-label="关闭登录面板"
            >
              稍后再说
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
