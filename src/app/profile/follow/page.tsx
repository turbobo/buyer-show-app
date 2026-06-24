'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'
import { fetchFollowing, fetchFollowers } from '@/services/follow'
import { USER_ROLE } from '@/lib/constants'
import FollowButton from '@/components/FollowButton'
import ProfileSubPageLayout, { EmptyState } from '@/components/layout/ProfileSubPageLayout'
import type { User } from '@/types'

type TabKey = 'following' | 'followers'

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'following', label: '关注' },
  { key: 'followers', label: '粉丝' },
]

export default function ProfileFollowPage() {
  const router = useRouter()
  const { user, isLoggedIn, authReady } = useUserStore()
  const addToast = useUIStore((s) => s.addToast)

  const [tab, setTab] = useState<TabKey>('following')
  const [following, setFollowing] = useState<User[]>([])
  const [followers, setFollowers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authReady) return
    if (!isLoggedIn || !user) {
      router.replace('/profile')
      return
    }
    let cancelled = false
    setLoading(true)
    Promise.all([fetchFollowing(user.id), fetchFollowers(user.id)])
      .then(([f, r]) => {
        if (cancelled) return
        setFollowing(f)
        setFollowers(r)
      })
      .catch((err: unknown) => {
        if (!cancelled) addToast('error', err instanceof Error ? err.message : '加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [authReady, isLoggedIn, user, router, addToast])

  const list = tab === 'following' ? following : followers
  const count = list.length

  return (
    <ProfileSubPageLayout
      title="关注与粉丝"
      extra={
        !loading && (
          <span className="text-sm text-gray-400">
            共 <span className="font-num text-coral-500 font-semibold">{count}</span> 人
          </span>
        )
      }
    >
      {/* Tab Bar */}
      <div className="flex items-center gap-1 mb-5 bg-white rounded-full p-1 shadow-sm w-fit">
        {TABS.map((t) => (
          <motion.button
            key={t.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTab(t.key)}
            className={`px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-gradient-to-r from-coral-500 to-coral-400 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-[11px] opacity-80 font-num">
              {t.key === 'following' ? following.length : followers.length}
            </span>
          </motion.button>
        ))}
      </div>

      {loading ? (
        <Skeleton />
      ) : list.length === 0 ? (
        <EmptyState
          title={
            tab === 'following'
              ? '还没有关注任何人'
              : '还没有粉丝'
          }
          hint={
            tab === 'following'
              ? '去详情页关注喜欢的作者吧'
              : '分享更多买家秀，吸引粉丝关注'
          }
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D1D5DB"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          }
        />
      ) : (
        <div className="space-y-2 max-w-2xl">
          {list.map((u, i) => (
            <Row key={u.id} user={u} index={i} currentUserId={user?.id ?? ''} />
          ))}
        </div>
      )}
    </ProfileSubPageLayout>
  )
}

function Row({
  user,
  index,
  currentUserId,
}: {
  user: User
  index: number
  currentUserId: string
}) {
  const isSelf = user.id === currentUserId
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3"
    >
      <Link href={`/user/${user.id}`} className="shrink-0">
        <img
          src={user.avatar_url || ''}
          alt={user.nickname || '用户头像'}
          loading="lazy"
          className="w-12 h-12 rounded-full object-cover hover:ring-2 hover:ring-coral-200 transition-all"
        />
      </Link>

      <Link href={`/user/${user.id}`} className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {user.nickname || '未命名'}
          </p>
          {user.role === USER_ROLE.ADMIN && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-coral-50 text-coral-500 font-medium">
              管理员
            </span>
          )}
        </div>
        {user.bio && <p className="text-xs text-gray-500 truncate mt-0.5">{user.bio}</p>}
        <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1 font-num">
          <span>{user.post_count} 帖</span>
          <span>{user.follower_count} 粉丝</span>
          <span>{user.following_count} 关注</span>
        </div>
      </Link>

      {!isSelf && <FollowButton targetUserId={user.id} size="sm" />}
    </motion.div>
  )
}

function Skeleton() {
  return (
    <div className="space-y-2 max-w-2xl">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 animate-pulse"
        >
          <div className="w-12 h-12 rounded-full bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 bg-gray-100 rounded" />
            <div className="h-2 w-36 bg-gray-100 rounded" />
          </div>
          <div className="w-16 h-7 rounded-full bg-gray-100" />
        </div>
      ))}
    </div>
  )
}
