'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'
import { updateProfile, isNicknameAvailable } from '@/services/user'
import { compressAvatar } from '@/lib/image-utils'
import ProfileSubPageLayout from '@/components/layout/ProfileSubPageLayout'

export default function ProfileEditPage() {
  const router = useRouter()
  const { user, isLoggedIn, authReady, setUser } = useUserStore()
  const addToast = useUIStore((s) => s.addToast)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 异步昵称占用提示
  const [nicknameStatus, setNicknameStatus] = useState<
    'idle' | 'checking' | 'ok' | 'taken' | 'invalid'
  >('idle')

  useEffect(() => {
    if (!authReady) return
    if (!isLoggedIn || !user) {
      router.replace('/profile')
      return
    }
    setNickname(user.nickname || '')
    setBio(user.bio || '')
    setAvatarUrl(user.avatar_url || '')
  }, [authReady, isLoggedIn, user, router])

  // 昵称去重防抖
  useEffect(() => {
    if (!user) return
    const trimmed = nickname.trim()
    if (trimmed === (user.nickname || '')) {
      setNicknameStatus('idle')
      return
    }
    if (trimmed.length < 2 || trimmed.length > 20) {
      setNicknameStatus('invalid')
      return
    }
    setNicknameStatus('checking')
    const timer = setTimeout(async () => {
      try {
        const ok = await isNicknameAvailable(trimmed, user.id)
        setNicknameStatus(ok ? 'ok' : 'taken')
      } catch {
        setNicknameStatus('idle')
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [nickname, user])

  const handleAvatarPick = () => fileInputRef.current?.click()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      addToast('error', '请选择图片文件')
      return
    }
    try {
      const dataUrl = await compressAvatar(file)
      setAvatarUrl(dataUrl)
    } catch {
      addToast('error', '图片处理失败，请换一张试试')
    }
    e.target.value = ''
  }

  const handleSubmit = async () => {
    if (!user) return
    if (nicknameStatus === 'taken') {
      addToast('error', '该昵称已被使用')
      return
    }
    if (nicknameStatus === 'invalid') {
      addToast('error', '昵称需 2-20 字')
      return
    }

    setSubmitting(true)
    try {
      const updated = await updateProfile({
        nickname: nickname.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl,
      })
      setUser(updated)
      addToast('success', '资料已更新')
      router.back()
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : '更新失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (!authReady || !user) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          className="w-7 h-7 border-2 border-coral-200 border-t-coral-500 rounded-full"
        />
      </div>
    )
  }

  const nicknameHint =
    nicknameStatus === 'invalid' ? '昵称需 2-20 字'
      : nicknameStatus === 'taken' ? '该昵称已被使用'
        : nicknameStatus === 'checking' ? '检查中...'
          : nicknameStatus === 'ok' ? '昵称可用'
            : ''
  const nicknameHintColor =
    nicknameStatus === 'ok' ? 'text-emerald-500'
      : nicknameStatus === 'checking' ? 'text-gray-400'
        : 'text-coral-500'

  return (
    <ProfileSubPageLayout title="编辑资料">
      <div className="md:max-w-2xl md:mx-auto space-y-6">
        {/* 头像 */}
        <section className="bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleAvatarPick}
            className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-coral-100 shadow-sm group"
            aria-label="更换头像"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="头像" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-coral-200 to-orange-200 flex items-center justify-center text-white text-3xl font-bold">
                {nickname.charAt(0) || 'U'}
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end justify-center pb-1.5">
              <span className="text-[10px] text-white opacity-0 group-hover:opacity-100">点击更换</span>
            </div>
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-xs text-gray-400 mt-3">
            支持任意尺寸图片，自动压缩
          </p>
        </section>

        {/* 昵称 */}
        <section>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            昵称 <span className="text-coral-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, 20))}
              placeholder="2-20 个字符"
              className="w-full bg-white rounded-2xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 shadow-sm border-0 outline-none focus:ring-2 focus:ring-coral-200 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-gray-300">
              {nickname.length}/20
            </span>
          </div>
          {nicknameHint && (
            <p className={`mt-1.5 text-[11px] ${nicknameHintColor}`}>{nicknameHint}</p>
          )}
        </section>

        {/* 个人简介 */}
        <section>
          <label className="block text-sm font-medium text-gray-700 mb-2">个人简介</label>
          <div className="relative">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 200))}
              placeholder="一句话介绍自己..."
              rows={3}
              className="w-full bg-white rounded-2xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 shadow-sm border-0 outline-none focus:ring-2 focus:ring-coral-200 transition-all resize-none"
            />
            <span className="absolute right-4 bottom-3 text-[11px] text-gray-300">
              {bio.length}/200
            </span>
          </div>
        </section>

        {/* 提交按钮 */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={submitting || nicknameStatus === 'checking' || nicknameStatus === 'invalid' || nicknameStatus === 'taken'}
          aria-disabled={submitting}
          className={`w-full py-3.5 rounded-2xl text-base font-semibold shadow-lg transition-all duration-300 ${
            submitting
              ? 'bg-coral-300 text-white shadow-coral-200/30 cursor-wait'
              : nicknameStatus === 'taken' || nicknameStatus === 'invalid'
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
              保存中...
            </span>
          ) : (
            '保存'
          )}
        </motion.button>
      </div>
    </ProfileSubPageLayout>
  )
}
