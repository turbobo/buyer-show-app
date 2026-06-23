'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUserStore } from '@/store/user'
import { fetchUserComments } from '@/services/post'
import ProfileSubPageLayout, { EmptyState } from '@/components/layout/ProfileSubPageLayout'
import type { Comment, Post } from '@/types'

type CommentWithPost = Comment & { post?: Pick<Post, 'id' | 'title' | 'images'> }

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m}分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}小时前`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}天前`
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export default function MyCommentsPage() {
  const router = useRouter()
  const { user, isLoggedIn, authReady } = useUserStore()
  const [comments, setComments] = useState<CommentWithPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authReady) return
    if (!isLoggedIn || !user) {
      router.replace('/profile')
      return
    }
    fetchUserComments(user.id)
      .then(setComments)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [authReady, isLoggedIn, user, router])

  return (
    <ProfileSubPageLayout
      title="我的评论"
      extra={!loading && (
        <span className="text-sm text-gray-400">共 <span className="font-num text-coral-500 font-semibold">{comments.length}</span> 条</span>
      )}
    >
      {loading ? (
        <CommentSkeleton />
      ) : comments.length === 0 ? (
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
              {/* 评论内容 */}
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                {c.content}
              </p>
              <p className="text-xs text-gray-400 mt-2 font-num">{formatTime(c.created_at)}</p>

              {/* 关联原帖 */}
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
