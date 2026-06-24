'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUIStore } from '@/store/ui'
import { sendPasswordResetEmail } from '@/services/auth'

type PageState = 'idle' | 'sending' | 'sent'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const addToast = useUIStore((s) => s.addToast)

  const [email, setEmail] = useState('')
  const [state, setState] = useState<PageState>('idle')

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const handleSend = async () => {
    if (!email.trim()) return addToast('error', '请输入邮箱')
    if (!emailValid) return addToast('error', '邮箱格式不正确')

    setState('sending')
    try {
      await sendPasswordResetEmail(email.trim())
      setState('sent')
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : '发送失败')
      setState('idle')
    }
  }

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center px-6 md:pt-16">
      {/* 返回按钮 */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="fixed top-4 left-4 md:top-20 md:left-8 z-30 w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center"
        aria-label="返回"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[380px]"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-coral-100 to-coral-50 flex items-center justify-center mx-auto mb-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">找回密码</h1>
          <p className="text-caption text-gray-400 mt-1">输入注册邮箱，我们将发送重置链接</p>
        </div>

        {/* 卡片 */}
        <div className="bg-white rounded-modal shadow-card p-6">
          {state === 'sent' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-4"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-800">邮件已发送</h2>
              <p className="text-sm text-gray-500">
                请检查 <span className="font-medium text-gray-700">{email}</span> 的收件箱，
                点击邮件中的链接重置密码
              </p>
              <p className="text-xs text-gray-400">没收到？请检查垃圾邮件文件夹</p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/login')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-coral-500 to-coral-400 text-white text-body font-semibold shadow-coral transition-all"
              >
                返回登录
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* 邮箱输入 */}
              <div>
                <label htmlFor="reset-email" className="block text-caption text-gray-500 mb-1.5">注册邮箱</label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-body text-gray-800 placeholder-gray-300 outline-none focus:border-coral-300 focus:ring-1 focus:ring-coral-100 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
              </div>

              {/* 发送按钮 */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                disabled={state === 'sending' || !emailValid}
                onClick={handleSend}
                className={`w-full h-12 rounded-xl text-body font-semibold text-white transition-all duration-200 ${
                  state === 'sending'
                    ? 'bg-coral-300 cursor-not-allowed'
                    : !emailValid
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-coral-500 to-coral-400 shadow-coral'
                }`}
              >
                {state === 'sending' ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    发送中...
                  </span>
                ) : '发送重置链接'}
              </motion.button>

              {/* 返回登录 */}
              <p className="text-center text-tiny text-gray-400">
                想起密码了？
                <button onClick={() => router.push('/login')} className="text-coral-500 font-medium ml-1">
                  返回登录
                </button>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
