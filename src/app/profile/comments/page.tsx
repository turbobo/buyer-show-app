'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'
import { fetchUserComments, fetchUserCommentsGroupedByPost } from '@/services/comment'
import ProfileSubPageLayout, { EmptyState } from '@/components/layout/ProfileSubPageLayout'
import type { Comment, Post } from '@/types'

type TabKey = 'flat' | 'by-post'
const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'flat', label: '按时间' },
  { key: 'by-post', label: '按帖子' },
]

type CommentWithPost = Comment & { post?: Pick<Post, 'id' | 'title' | 'images'> }

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}天前`
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export default function MyCommentsPage() {
  const router = useRouter()
  const { user, isLoggedIn, authReady } = useUserStore()
  const [tab, setTab] = useState<TabKey>('flat')

  const [comments, setComments] = useState<CommentWithPost[]>([])
  const [grouped, setGrouped] = useState<Array<{ post: Pick<Post, 'id' | 'title' | 'images'>; comments: Comment[] }>>([])
  const [loading, setLoading] = useState(true)

  const addToast = useUIStore((s) => s.addToast)

  useEffect(() => {
    if (!authReady) return
    if (!isLoggedIn || !user) {
      router.replace('/profile')
      return
    }

    setLoading(true)
    let cancelled = false
    const fetchPromise =
      tab === 'flat'
        ? fetchUserComments(user.id).then((data) => { if (!cancelled) setComments(data) })
        : fetchUserCommentsGroupedByPost(user.id).then((data) => { if (!cancelled) setGrouped(data) })

    fetchPromise
      .catch((err: unknown) => {
        addToast('error', err instanceof Error ? err.message : '加载评论失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [authReady, isLoggedIn, user, router, tab, addToast])

  const totalCount =
    tab === 'flat' ? comments.length : grouped.reduce((n, g) => n + g.comments.length, 0)

  return (
    <ProfileSubPageLayout
      title="我的评论"
      extra={!loading && (
        <span className="text-sm text-gray-400">共 <span className="font-num text-coral-500 font-semibold">{totalCount}</span> 条</span>
      )}
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
          </motion.button>
        ))}
      </div>

      {loading ? (
        <CommentSkeleton />
      ) : tab === 'flat' ? (
        comments.length === 0 ? (
          <EmptyState
            title="还没有评论过内容"
            hint="对喜欢的帖子留下你的看法吧"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            }
          />
        ) : (
          <div className="space-y-3 max-w-2xl">
            {comments.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl p-4 shadow-sm"
              >
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                  {c.content}
                </p>
                <p className="text-xs text-gray-400 mt-2 font-num">{formatTime(c.created_at)}</p>

                {c.post && (
                  <Link href={`/post/${c.post.id}`}>
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className="mt-3 flex items-center gap-3 p-2.5 rounded-xl bg-warm-50 hover:bg-coral-50/40 transition-colors cursor-pointer"
                    >
                      {c.post.images?.[0] && (
                        <img
                          src={c.post.images[0]}
                          alt=""
                          loading="lazy"
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 mb-0.5">原帖</p>
                        <p className="text-sm text-gray-700 truncate">{c.post.title}</p>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </motion.div>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        )
      ) : grouped.length === 0 ? (
        <EmptyState
          title="还没有评论过内容"
          hint="对喜欢的帖子留下你的看法吧"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          }
        />
      ) : (
        <div className="space-y-4 max-w-2xl">
          {grouped.map((g, gi) => (
            <motion.div
              key={g.post?.id || gi}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              {/* 帖子头 */}
              <Link href={`/post/${g.post?.id || ''}`}>
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-warm-50 hover:bg-coral-50/40 transition-colors cursor-pointer"
                >
                  {g.post?.images?.[0] && (
                    <img
                      src={g.post.images[0]}
                      alt=""
                      loading="lazy"
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">原帖 · {g.comments.length} 条评论</p>
                    <p className="text-sm text-gray-800 font-medium truncate">{g.post?.title}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </motion.div>
              </Link>

              {/* 评论列表 */}
              <div className="divide-y divide-gray-50 mt-3">
                {g.comments.map((c) => (
                  <div key={c.id} className="py-2.5">
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                      {c.content}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-num">
                      {formatTime(c.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </ProfileSubPageLayout>
  )
}

function CommentSkeleton() {
  return (
    <div className="space-y-3 max-w-2xl">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="space-y-2">
            <div className="h-3 bg-gray-100 rounded animate-pulse w-full" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
          </div>
          <div className="mt-3 h-12 bg-gray-50 rounded-xl animate-pulse" />
        </div>
      ))}
    </div>
  )
}
