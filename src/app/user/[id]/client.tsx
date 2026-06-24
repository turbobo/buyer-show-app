'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { fetchUserPosts } from '@/services/user'
import { isFollowing } from '@/services/follow'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'
import PostCard from '@/components/PostCard'
import FollowButton from '@/components/FollowButton'
import MobileBackButton from '@/components/MobileBackButton'
import type { Post, User } from '@/types'
import { supabase } from '@/lib/supabase'
import { USER_ROLE } from '@/lib/constants'

export default function UserDetailClient() {
  const params = useParams()
  const router = useRouter()
  const targetId = params.id as string
  const currentUser = useUserStore((s) => s.user)
  const authReady = useUserStore((s) => s.authReady)
  const addToast = useUIStore((s) => s.addToast)

  const [profile, setProfile] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const isSelf = currentUser?.id === targetId

  useEffect(() => {
    if (!authReady) return
    let cancelled = false
    setLoading(true)

    Promise.all([
      supabase.from('profiles').select('*').eq('id', targetId).single(),
      fetchUserPosts(targetId),
      isFollowing(targetId).catch(() => false),
    ])
      .then(([profileRes, postList, isFollowingRes]) => {
        if (cancelled) return
        if (profileRes.error || !profileRes.data) {
          setNotFound(true)
          return
        }
        setProfile(profileRes.data as User)
        setPosts(postList)
        setFollowing(isFollowingRes)
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
  }, [authReady, targetId, addToast])

  if (!authReady || loading) {
    return (
      <div className="px-5 pt-6 md:pt-2">
        <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse flex items-center gap-4 mb-5">
          <div className="w-20 h-20 rounded-full bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-gray-100 rounded" />
            <div className="h-3 w-48 bg-gray-100 rounded" />
            <div className="h-3 w-40 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-60 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-base text-gray-700 mb-1">用户不存在或已注销</p>
        <p className="text-xs text-gray-400 mb-4">该账号可能已被封禁或注销</p>
        <button
          onClick={() => router.push('/')}
          className="px-5 py-2 rounded-full bg-coral-500 text-white text-sm shadow-sm shadow-coral-200/50"
        >
          返回首页
        </button>
      </div>
    )
  }

  return (
    <div className="px-5 pt-6 md:pt-2 pb-8 relative">
      <MobileBackButton />
      {/* ── 用户卡片 ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 md:p-6 shadow-sm mb-6"
      >
        <div className="flex items-start gap-4">
          <img
            src={profile.avatar_url || ''}
            alt={profile.nickname || '用户头像'}
            loading="lazy"
            className="w-20 h-20 rounded-full object-cover shrink-0 border-2 border-coral-100"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-gray-800 truncate">
                {profile.nickname || '未命名'}
              </h1>
              {profile.role === USER_ROLE.ADMIN && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-coral-50 text-coral-500 font-medium">
                  管理员
                </span>
              )}
              {isSelf && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  自己
                </span>
              )}
            </div>
            {profile.bio && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{profile.bio}</p>
            )}
            <div className="flex items-center gap-5 mt-3 text-sm">
              <Stat label="发布" value={profile.post_count} />
              <Stat label="粉丝" value={profile.follower_count} />
              <Stat label="关注" value={profile.following_count} />
            </div>
          </div>
        </div>

        {/* 操作按钮区 */}
        {!isSelf && (
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2">
            <FollowButton
              targetUserId={profile.id}
              initialFollowing={following}
              size="md"
              onChange={(f) => {
                setFollowing(f)
                // 同步卡片上的 follower_count
                setProfile((prev) =>
                  prev
                    ? {
                        ...prev,
                        follower_count: Math.max(0, prev.follower_count + (f ? 1 : -1)),
                      }
                    : prev,
                )
              }}
            />
          </div>
        )}
      </motion.div>

      {/* ── 帖子列表 ── */}
      <div className="mb-4 flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-coral-500 to-coral-300" />
        <h2 className="text-base font-semibold text-gray-800">
          {isSelf ? '我的买家秀' : 'TA 的买家秀'}
        </h2>
        <span className="text-xs text-gray-400 ml-1">({posts.length})</span>
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
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
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <p className="text-sm text-gray-400 mb-1">
            {isSelf ? '还没有发布买家秀' : 'TA 还没有发布买家秀'}
          </p>
          <p className="text-xs text-gray-300">
            {isSelf ? '去「发布」分享你的好物吧' : '关注 TA，第一时间收到新帖通知'}
          </p>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  const display = value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value)
  return (
    <div className="flex items-baseline gap-1">
      <span className="font-num font-semibold text-gray-800">{display}</span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  )
}
