'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUIStore } from '@/store/ui'
import { supabase } from '@/lib/supabase'
import { resetPassword } from '@/services/auth'

type PageState = 'loading' | 'ready' | 'submitting' | 'success' | 'error'

export default function ResetPasswordPage() {
  const router = useRouter()
  const addToast = useUIStore((s) => s.addToast)

  const [state, setState] = useState<PageState>('loading')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setState('ready')
      }
    })

    const timer = setTimeout(() => {
      setState((prev) => prev === 'loading' ? 'error' : prev)
    }, 10000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  const pwdError = newPwd.length > 0 && newPwd.length < 6 ? '密码至少 6 位' : ''
  const confirmError = confirmPwd.length > 0 && confirmPwd !== newPwd ? '两次密码不一致' : ''
  const isSubmitting = state === 'submitting'
  const canSubmit = newPwd.length >= 6 && confirmPwd === newPwd && state === 'ready'

  const handleSubmit = async () => {
    if (!canSubmit) return

    setState('submitting')
    try {
      await resetPassword(newPwd)
      setState('success')
      addToast('success', '密码重置成功')
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : '重置失败')
      setState('ready')
    }
  }

  const inputClass = 'w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-body text-gray-800 placeholder-gray-300 outline-none focus:border-coral-300 focus:ring-1 focus:ring-coral-100 transition-all'

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center px-6 md:pt-16">
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
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">重置密码</h1>
        </div>

        {/* 卡片 */}
        <div className="bg-white rounded-modal shadow-card p-6">
          {/* 加载中 */}
          {state === 'loading' && (
            <div className="text-center py-8 space-y-3">
              <div className="w-8 h-8 border-3 border-coral-200 border-t-coral-500 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500">正在验证重置链接...</p>
            </div>
          )}

          {/* 链接失效 */}
          {state === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4 space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-800">链接已失效</h2>
              <p className="text-sm text-gray-500">重置链接可能已过期或无效，请重新发送</p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/auth/forgot-password')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-coral-500 to-coral-400 text-white text-body font-semibold shadow-coral transition-all"
              >
                重新发送重置链接
              </motion.button>
            </motion.div>
          )}

          {/* 输入新密码 */}
          {(state === 'ready' || state === 'submitting') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <p className="text-sm text-gray-500 text-center mb-2">请设置您的新密码</p>

              <div>
                <label htmlFor="new-pwd" className="block text-caption text-gray-500 mb-1.5">新密码</label>
                <div className="relative">
                  <input
                    id="new-pwd"
                    type={showPwd ? 'text' : 'password'}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="至少 6 位"
                    autoComplete="new-password"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPwd ? '隐藏密码' : '显示密码'}
                  >
                    {showPwd ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {pwdError && <p className="mt-1.5 text-[11px] text-coral-500">{pwdError}</p>}
              </div>

              <div>
                <label htmlFor="confirm-pwd" className="block text-caption text-gray-500 mb-1.5">确认新密码</label>
                <input
                  id="confirm-pwd"
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="再次输入新密码"
                  autoComplete="new-password"
                  className={inputClass}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                {confirmError && <p className="mt-1.5 text-[11px] text-coral-500">{confirmError}</p>}
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                disabled={!canSubmit}
                onClick={handleSubmit}
                className={`w-full h-12 rounded-xl text-body font-semibold text-white transition-all duration-200 ${
                  isSubmitting
                    ? 'bg-coral-300 cursor-not-allowed'
                    : !canSubmit
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-coral-500 to-coral-400 shadow-coral'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    重置中...
                  </span>
                ) : '确认重置'}
              </motion.button>
            </motion.div>
          )}

          {/* 成功 */}
          {state === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-800">密码已重置</h2>
              <p className="text-sm text-gray-500">请使用新密码登录</p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/login')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-coral-500 to-coral-400 text-white text-body font-semibold shadow-coral transition-all"
              >
                去登录
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
