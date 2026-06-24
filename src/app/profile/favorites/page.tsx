'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import {
  fetchUserFavorites,
  fetchUserFavoriteComments,
  fetchUserFavoriteTags,
  toggleTagFavorite,
} from '@/services/favorite'
import PostCard from '@/components/PostCard'
import CommentItem from '@/components/CommentItem'
import ProfileSubPageLayout, { EmptyState, GridSkeleton } from '@/components/layout/ProfileSubPageLayout'
import type { Post, Comment } from '@/types'

type TabKey = 'posts' | 'comments' | 'tags'

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'posts', label: '帖子' },
  { key: 'comments', label: '评论' },
  { key: 'tags', label: '标签' },
]

export default function MyFavoritesPage() {
  const router = useRouter()
  const { user, isLoggedIn, authReady } = useUserStore()
  const addToast = useUIStore((s) => s.addToast)
  const { guard } = useAuthGuard()
  const [tab, setTab] = useState<TabKey>('posts')

  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // 根据 tab 拉取对应数据
  useEffect(() => {
    if (!authReady) return
    if (!isLoggedIn || !user) {
      router.replace('/profile')
      return
    }

    setLoading(true)
    let cancelled = false
    const fetchPromise =
      tab === 'posts'
        ? fetchUserFavorites(user.id).then(setPosts)
        : tab === 'comments'
          ? fetchUserFavoriteComments(user.id).then(setComments)
          : fetchUserFavoriteTags(user.id).then(setTags)

    fetchPromise
      .catch((err: unknown) => {
        addToast('error', err instanceof Error ? err.message : '加载收藏失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [authReady, isLoggedIn, user, router, tab, addToast])

  const handleTagUnfavorite = (tag: string) => {
    guard(async () => {
      await toggleTagFavorite(tag)
      setTags((prev) => prev.filter((t) => t !== tag))
      addToast('success', `已取消收藏 #${tag}`)
    }, '收藏标签')
  }

  const count = tab === 'posts' ? posts.length : tab === 'comments' ? comments.length : tags.length

  return (
    <ProfileSubPageLayout
      title="我的收藏"
      extra={!loading && (
        <span className="text-sm text-gray-400">共 <span className="font-num text-coral-500 font-semibold">{count}</span> 项</span>
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
        <GridSkeleton />
      ) : tab === 'posts' ? (
        posts.length === 0 ? (
          <EmptyState
            title="还没有收藏帖子"
            hint="点击帖子右下角的⭐收藏好物"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
            }
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )
      ) : tab === 'comments' ? (
        comments.length === 0 ? (
          <EmptyState
            title="还没有收藏评论"
            hint="点击评论右侧的⭐收藏优质观点"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            }
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50 px-5">
            {comments.map((c) => (
              <div key={c.id}>
                <div className="flex items-center gap-1.5 pt-3 text-xs text-gray-400">
                  <span>帖子</span>
                  <button
                    onClick={() => router.push(`/post/${c.post_id}`)}
                    className="text-coral-500 hover:underline truncate max-w-[70%]"
                  >
                    {c.post_id.slice(0, 8)}...
                  </button>
                </div>
                <CommentItem comment={c} initialFavorited />
              </div>
            ))}
          </div>
        )
      ) : (
        tags.length === 0 ? (
          <EmptyState
            title="还没有收藏标签"
            hint="在「搜索」页为热门标签点上⭐关注"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            }
          />
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {tags.map((tag) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1 bg-white rounded-2xl pl-4 pr-1.5 py-1.5 border border-gray-100 shadow-sm"
              >
                <button
                  onClick={() => router.push(`/search?q=${encodeURIComponent(tag)}`)}
                  className="text-sm font-medium text-gray-700 hover:text-coral-500 transition-colors"
                >
                  <span className="text-coral-400 mr-1">#</span>{tag}
                </button>
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => handleTagUnfavorite(tag)}
                  aria-label={`取消收藏标签 ${tag}`}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-coral-400 hover:bg-coral-50 transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </motion.button>
              </motion.div>
            ))}
          </div>
        )
      )}
    </ProfileSubPageLayout>
  )
}
