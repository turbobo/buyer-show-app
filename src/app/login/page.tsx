'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/ui'
import { useUserStore } from '@/store/user'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

type AuthMode = 'login' | 'register'

export default function LoginPage() {
  const router = useRouter()
  const addToast = useUIStore((s) => s.addToast)
  const setUser = useUserStore((s) => s.setUser)

  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'))
    setPassword('')
    setConfirmPassword('')
  }

  const handleLogin = async () => {
    if (!email.trim()) return addToast('error', '请输入邮箱')
    if (!password) return addToast('error', '请输入密码')

    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) throw error

      // 加载用户资料
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

      addToast('success', '登录成功')
      setTimeout(() => router.back(), 500)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '登录失败'
      if (message.includes('Invalid login credentials')) {
        addToast('error', '邮箱或密码错误')
      } else if (message.includes('Email not confirmed')) {
        addToast('error', '请先验证邮箱')
      } else {
        addToast('error', `登录失败: ${message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!nickname.trim()) return addToast('error', '请输入昵称')
    if (nickname.trim().length < 2) return addToast('error', '昵称至少 2 个字符')
    if (!email.trim()) return addToast('error', '请输入邮箱')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return addToast('error', '邮箱格式不正确')
    if (password.length < 6) return addToast('error', '密码至少 6 位')
    if (password !== confirmPassword) return addToast('error', '两次密码不一致')

    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { nickname: nickname.trim() },
        },
      })
      if (error) throw error

      addToast('success', '注册成功！请查收验证邮件后登录')
      setMode('login')
      setPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '注册失败'
      if (message.includes('already registered')) {
        addToast('error', '该邮箱已被注册')
      } else {
        addToast('error', `注册失败: ${message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'login') handleLogin()
    else handleRegister()
  }

  const isLogin = mode === 'login'

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center px-6 md:pt-16">
      {/* Back button */}
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
          <img src="/logo.svg" alt="买家说" width={56} height={56} className="mx-auto mb-3" />
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A5C 50%, #FFAB87 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            买家说
          </h1>
          <p className="text-caption text-gray-400 mt-1">真实购物体验 · 好物发现社区</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-modal shadow-card p-6">
          {/* Tab switch */}
          <div className="flex bg-gray-50 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setPassword(''); setConfirmPassword('') }}
              className={`flex-1 py-2.5 rounded-lg text-body font-medium transition-all duration-200 ${
                isLogin ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => { setMode('register'); setPassword(''); setConfirmPassword('') }}
              className={`flex-1 py-2.5 rounded-lg text-body font-medium transition-all duration-200 ${
                !isLogin ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'
              }`}
            >
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Register: nickname */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label htmlFor="nickname" className="block text-caption text-gray-500 mb-1.5">昵称</label>
                  <input
                    id="nickname"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="给自己取个名字"
                    maxLength={20}
                    className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-body text-gray-800 placeholder-gray-300 outline-none focus:border-coral-300 focus:ring-1 focus:ring-coral-100 transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-caption text-gray-500 mb-1.5">邮箱</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoComplete="email"
                className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-body text-gray-800 placeholder-gray-300 outline-none focus:border-coral-300 focus:ring-1 focus:ring-coral-100 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-caption text-gray-500 mb-1.5">密码</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? '输入密码' : '至少 6 位'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-body text-gray-800 placeholder-gray-300 outline-none focus:border-coral-300 focus:ring-1 focus:ring-coral-100 transition-all"
              />
            </div>

            {/* Confirm password (register only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label htmlFor="confirmPassword" className="block text-caption text-gray-500 mb-1.5">确认密码</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再输入一次密码"
                    autoComplete="new-password"
                    className="w-full h-11 px-4 rounded-xl bg-gray-50 border border-gray-100 text-body text-gray-800 placeholder-gray-300 outline-none focus:border-coral-300 focus:ring-1 focus:ring-coral-100 transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.96 }}
              disabled={loading}
              className={`w-full h-12 rounded-xl text-body font-semibold text-white transition-all duration-200 ${
                loading
                  ? 'bg-coral-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-coral-500 to-coral-400 shadow-coral'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isLogin ? '登录中...' : '注册中...'}
                </span>
              ) : (
                isLogin ? '登录' : '注册'
              )}
            </motion.button>
          </form>

          {/* Switch hint */}
          <p className="text-center text-tiny text-gray-400 mt-4">
            {isLogin ? '还没有账号？' : '已有账号？'}
            <button onClick={switchMode} className="text-coral-500 font-medium ml-1">
              {isLogin ? '立即注册' : '去登录'}
            </button>
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-tiny text-gray-300 mt-6">
          注册即表示同意用户协议和隐私政策
        </p>
      </motion.div>
    </div>
  )
}
