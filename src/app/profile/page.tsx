'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import PostCard from '@/components/PostCard'
import { useUserStore } from '@/store/user'
import { supabase } from '@/lib/supabase'
import { openLoginSheet, quickLogout } from '@/lib/auth-helpers'
import { useUIStore } from '@/store/ui'
import { deleteAccount } from '@/services/user'
import type { Post } from '@/types'

const MENU_ITEMS: Array<{
  label: string
  href: string | null
  icon: React.ReactNode
  color: string
}> = [
  {
    label: '编辑资料',
    href: '/profile/edit',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    color: 'from-pink-400 to-rose-400',
  },
  {
    label: '我的发布',
    href: '/profile/posts',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    color: 'from-coral-400 to-orange-400',
  },
  {
    label: '我的收藏',
    href: '/profile/favorites',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
    ),
    color: 'from-amber-400 to-yellow-400',
  },
  {
    label: '我的评论',
    href: '/profile/comments',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    color: 'from-sky-400 to-blue-400',
  },
  {
    label: '设置',
    href: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    color: 'from-gray-400 to-gray-500',
  },
]

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoggedIn, authReady } = useUserStore()
  const [toast, setToast] = useState<string | null>(null)
  const [userPosts, setUserPosts] = useState<Post[]>([])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const handleMenuClick = (item: typeof MENU_ITEMS[number]) => {
    if (item.href) {
      router.push(item.href)
    } else {
      showToast(`${item.label} - 功能开发中`)
    }
  }

  const handleLogin = () => {
    openLoginSheet('查看个人信息')
  }

  const handleLogout = async () => {
    await quickLogout()
  }

  // Fetch user posts from Supabase
  useEffect(() => {
    if (!isLoggedIn || !user) {
      setUserPosts([])
      return
    }
    supabase
      .from('posts')
      .select('*, user:profiles!posts_user_id_fkey(nickname, avatar_url)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setUserPosts(data as Post[])
      })
  }, [isLoggedIn, user])

  return (
    <div className="min-h-screen bg-warm-50 pb-28 md:px-8 md:pt-20">
      {/* ── Header ── */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-coral-500 via-coral-400 to-orange-300" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative px-5 pt-14 pb-8">
          {!authReady ? (
            /* ── Rehydrating Skeleton ── */
            <div className="flex flex-col items-center text-center py-8 animate-pulse">
              <div className="w-20 h-20 rounded-full bg-white/20 mb-4" />
              <div className="h-5 w-24 rounded bg-white/20 mb-2" />
              <div className="h-3 w-36 rounded bg-white/15" />
            </div>
          ) : !isLoggedIn ? (
            /* ── Login Prompt ── */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center py-8"
            >
              <motion.div
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center mb-4 cursor-pointer"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-1">点击登录</h2>
              <p className="text-sm text-white/70 mb-6">登录后查看更多功能</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className="px-8 py-2.5 rounded-full bg-white text-coral-500 font-semibold text-sm shadow-lg shadow-black/10"
              >
                立即登录
              </motion.button>
            </motion.div>
          ) : (
            /* ── User Card ── */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <div className="relative">
                <div className="w-[72px] h-[72px] rounded-full border-[3px] border-white/60 overflow-hidden shadow-lg">
                  <img
                    src={user!.avatar_url}
                    alt={user!.nickname}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-green-400 border-2 border-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white truncate">
                    {user!.nickname}
                  </h2>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => router.push('/profile/edit')}
                    aria-label="编辑资料"
                    className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </motion.button>
                </div>
                <p className="text-sm text-white/70 mt-0.5">{user!.bio}</p>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* ── Logged-in Content ── */}
      <AnimatePresence>
        {isLoggedIn && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-5 -mt-3"
          >
            {/* ── Stats Bar ── */}
            <motion.div
              custom={0}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl shadow-sm p-5 mb-5"
            >
              <div className="flex items-center justify-around">
                {[
                  { value: user.post_count, label: '发布' },
                  { value: user.follower_count, label: '粉丝' },
                  { value: user.following_count, label: '关注' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-xl font-bold text-gray-800">
                      {stat.value >= 1000
                        ? `${(stat.value / 1000).toFixed(1)}k`
                        : stat.value}
                    </span>
                    <span className="text-xs text-gray-400 mt-0.5">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ── Menu Items ── */}
            <motion.div
              custom={1}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl shadow-sm overflow-hidden mb-5"
            >
              {MENU_ITEMS.map((item, i) => (
                <motion.button
                  key={item.label}
                  whileTap={{ backgroundColor: '#f9f5f2' }}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${
                    i < MENU_ITEMS.length - 1 ? 'border-b border-gray-50' : ''
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-sm`}>
                    {item.icon}
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </motion.button>
              ))}
            </motion.div>

            {/* ── User Posts ── */}
            <motion.div
              custom={2}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 rounded-full bg-gradient-to-b from-coral-500 to-coral-300" />
                <h3 className="text-base font-semibold text-gray-800">我的买家秀</h3>
                <span className="text-xs text-gray-400 ml-1">({userPosts.length})</span>
              </div>

              {userPosts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {userPosts.map((post, i) => (
                    <PostCard key={post.id} post={post} index={i} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                  <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">还没有发布买家秀</p>
                  <p className="text-xs text-gray-300">分享你的购物体验吧</p>
                </div>
              )}
            </motion.div>

            {/* ── Logout Button ── */}
            <motion.div
              custom={3}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="mt-6 mb-4"
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={async () => {
                  await handleLogout()
                  showToast('已退出登录')
                }}
                className="w-full py-3.5 rounded-2xl text-sm font-medium text-gray-400 bg-white border border-gray-100 shadow-sm hover:text-red-400 hover:border-red-100 transition-all duration-200"
              >
                退出登录
              </motion.button>
            </motion.div>

            {/* ── Delete Account ── */}
            <motion.div
              custom={4}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="mb-4"
            >
              <button
                onClick={() => {
                  useUIStore.getState().openModal({
                    title: '注销账号',
                    description: '注销后帖子将被隐藏、昵称匿名化，且无法恢复。确定继续吗？',
                    confirmText: '确认注销',
                    confirmDanger: true,
                    onConfirm: async () => {
                      try {
                        await deleteAccount()
                        useUserStore.getState().logout()
                        useUIStore.getState().addToast('success', '账号已注销')
                        router.replace('/profile')
                      } catch (err: unknown) {
                        const msg = err instanceof Error ? err.message : '注销失败'
                        useUIStore.getState().addToast('error', msg)
                      }
                    },
                  })
                }}
                className="w-full text-center text-xs text-gray-300 hover:text-coral-500 transition-colors py-2"
              >
                注销账号
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-[200] bg-gray-800 text-white px-5 py-2.5 rounded-xl shadow-xl text-sm font-medium whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
