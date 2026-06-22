'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/ui'
import { useUserStore } from '@/store/user'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

export default function LoginSheet() {
  const { loginSheet, closeLoginSheet } = useUIStore((s) => ({
    loginSheet: s.loginSheet,
    closeLoginSheet: s.closeLoginSheet,
  }))
  const setUser = useUserStore((s) => s.setUser)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      // Supabase 匿名登录
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) throw error

      // 获取用户资料
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profile) {
          setUser(profile as User)
        }
      }

      closeLoginSheet()
      // 登录成功后执行之前的操作（如点赞、评论）
      loginSheet.onLogin?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '登录失败'
      useUIStore.getState().addToast('error', message)
    } finally {
      setLoading(false)
    }
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

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-modal p-6 safe-bottom z-[70]"
          >
            {/* Drag indicator */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
              <span className="text-3xl mb-3">👤</span>
              <h3 className="text-h2 text-gray-800">登录后{loginSheet.reason}</h3>
              <p className="text-caption text-gray-400 mt-1">
                登录即表示同意用户协议和隐私政策
              </p>
            </div>

            {/* Login buttons */}
            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleLogin}
                disabled={loading}
                className={`w-full btn-primary text-body py-3.5 ${loading ? 'opacity-60' : ''}`}
                aria-label="快捷登录"
              >
                {loading ? '登录中...' : '一键快捷登录'}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleLogin}
                disabled={loading}
                className={`w-full btn-secondary text-body py-3.5 ${loading ? 'opacity-60' : ''}`}
                aria-label="微信登录"
              >
                微信登录
              </motion.button>
            </div>

            {/* Close */}
            <button
              onClick={closeLoginSheet}
              disabled={loading}
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
