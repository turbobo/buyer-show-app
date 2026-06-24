'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { User } from '@/types'

interface Props {
  authReady: boolean
  isLoggedIn: boolean
  user: User | null
  onLogin: () => void
}

export default function ProfileHeader({ authReady, isLoggedIn, user, onLogin }: Props) {
  const router = useRouter()

  return (
    <header className="relative overflow-hidden max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-coral-500 via-coral-400 to-orange-300" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="relative px-5 md:px-6 pt-14 pb-8">
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
              onClick={onLogin}
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
              onClick={onLogin}
              className="px-8 py-2.5 rounded-full bg-white text-coral-500 font-semibold text-sm shadow-lg shadow-black/10"
            >
              立即登录
            </motion.button>
          </motion.div>
        ) : user ? (
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
                  src={user.avatar_url || ''}
                  alt={user.nickname || '用户头像'}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-green-400 border-2 border-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white truncate">
                  {user.nickname}
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
              <p className="text-sm text-white/70 mt-0.5">{user.bio || ''}</p>
            </div>
          </motion.div>
        ) : null}
      </div>
    </header>
  )
}
