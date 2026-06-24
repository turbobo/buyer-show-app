'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useUserStore } from '@/store/user'
import { USER_STATUS } from '@/lib/constants'
import { supabase } from '@/lib/supabase'

export default function BannedScreen() {
  const user = useUserStore((s) => s.user)
  const logout = useUserStore((s) => s.logout)
  const [loggingOut, setLoggingOut] = useState(false)

  if (!user || user.status !== USER_STATUS.BANNED) return null

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await supabase.auth.signOut()
    } finally {
      logout()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-warm-50 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[360px] text-center"
      >
        {/* 封禁图标 */}
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>

        {/* 用户信息 */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.nickname}
              className="w-10 h-10 rounded-full object-cover border border-gray-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral-200 to-orange-200 flex items-center justify-center text-white text-sm font-bold">
              {(user.nickname || 'U').charAt(0)}
            </div>
          )}
          <span className="text-sm text-gray-600 font-medium">{user.nickname}</span>
        </div>

        {/* 提示信息 */}
        <h1 className="text-xl font-bold text-gray-800 mb-2">账号已被封禁</h1>
        <p className="text-sm text-gray-500 mb-8">如有异议请联系管理员</p>

        {/* 退出登录按钮 */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          disabled={loggingOut}
          className={`w-full py-3.5 rounded-2xl text-base font-semibold transition-all duration-200 ${
            loggingOut
              ? 'bg-gray-200 text-gray-400 cursor-wait'
              : 'bg-gradient-to-r from-coral-500 to-coral-400 text-white shadow-coral'
          }`}
        >
          {loggingOut ? '退出中...' : '退出登录'}
        </motion.button>
      </motion.div>
    </div>
  )
}
