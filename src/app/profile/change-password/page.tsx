'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'
import { changePassword } from '@/services/auth'
import ProfileSubPageLayout from '@/components/layout/ProfileSubPageLayout'

export default function ChangePasswordPage() {
  const router = useRouter()
  const { isLoggedIn, authReady } = useUserStore()
  const addToast = useUIStore((s) => s.addToast)

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (!authReady) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-coral-200 border-t-coral-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!isLoggedIn) {
    router.replace('/profile')
    return null
  }

  const newPwdError = newPwd.length > 0 && newPwd.length < 6
    ? '密码至少 6 位'
    : newPwd.length > 0 && newPwd === currentPwd
      ? '新密码不能与当前密码相同'
      : ''

  const confirmError = confirmPwd.length > 0 && confirmPwd !== newPwd
    ? '两次密码不一致'
    : ''

  const canSubmit = currentPwd.length > 0
    && newPwd.length >= 6
    && newPwd !== currentPwd
    && confirmPwd === newPwd
    && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return

    setSubmitting(true)
    try {
      await changePassword(currentPwd, newPwd)
      addToast('success', '密码修改成功')
      router.back()
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : '修改失败')
    } finally {
      setSubmitting(false)
    }
  }

  const eyeButton = (visible: boolean, toggle: () => void) => (
    <button
      type="button"
      onClick={toggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
      aria-label={visible ? '隐藏密码' : '显示密码'}
    >
      {visible ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  )

  const inputClass = 'w-full bg-white rounded-2xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 shadow-sm border-0 outline-none focus:ring-2 focus:ring-coral-200 transition-all pr-12'

  return (
    <ProfileSubPageLayout title="修改密码">
      <div className="md:max-w-lg md:mx-auto space-y-5">
        {/* 当前密码 */}
        <section>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            当前密码 <span className="text-coral-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              placeholder="输入当前密码"
              autoComplete="current-password"
              className={inputClass}
            />
            {eyeButton(showCurrent, () => setShowCurrent((v) => !v))}
          </div>
        </section>

        {/* 新密码 */}
        <section>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            新密码 <span className="text-coral-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="至少 6 位"
              autoComplete="new-password"
              className={inputClass}
            />
            {eyeButton(showNew, () => setShowNew((v) => !v))}
          </div>
          {newPwdError && (
            <p className="mt-1.5 text-[11px] text-coral-500">{newPwdError}</p>
          )}
        </section>

        {/* 确认新密码 */}
        <section>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            确认新密码 <span className="text-coral-500">*</span>
          </label>
          <input
            type="password"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
            placeholder="再次输入新密码"
            autoComplete="new-password"
            className="w-full bg-white rounded-2xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 shadow-sm border-0 outline-none focus:ring-2 focus:ring-coral-200 transition-all"
          />
          {confirmError && (
            <p className="mt-1.5 text-[11px] text-coral-500">{confirmError}</p>
          )}
        </section>

        {/* 提交按钮 */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-3.5 rounded-2xl text-base font-semibold shadow-lg transition-all duration-300 ${
            submitting
              ? 'bg-coral-300 text-white cursor-wait'
              : !canSubmit
                ? 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
                : 'bg-gradient-to-r from-coral-500 to-coral-400 text-white shadow-coral-300/40'
          }`}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              修改中...
            </span>
          ) : '确认修改'}
        </motion.button>

        {/* 忘记密码链接 */}
        <button
          onClick={() => router.push('/auth/forgot-password')}
          className="w-full text-center text-xs text-gray-400 hover:text-coral-500 transition-colors py-2"
        >
          忘记当前密码？
        </button>
      </div>
    </ProfileSubPageLayout>
  )
}
