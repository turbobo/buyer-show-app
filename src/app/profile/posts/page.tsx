'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'
import { fetchUserPosts, deletePost } from '@/services/post'
import PostCard from '@/components/PostCard'
import ProfileSubPageLayout, { EmptyState, GridSkeleton } from '@/components/layout/ProfileSubPageLayout'
import type { Post } from '@/types'

export default function MyPostsPage() {
  const router = useRouter()
  const { user, isLoggedIn, authReady } = useUserStore()
  const addToast = useUIStore((s) => s.addToast)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!authReady) return
    if (!isLoggedIn || !user) {
      router.replace('/profile')
      return
    }
    fetchUserPosts(user.id)
      .then(setPosts)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [authReady, isLoggedIn, user, router])

  const handleEdit = (postId: string) => {
    router.push(`/post/${postId}/edit`)
  }

  const handleDelete = async () => {
    if (!confirmDeleteId) return
    setDeleting(true)
    try {
      await deletePost(confirmDeleteId)
      setPosts((prev) => prev.filter((p) => p.id !== confirmDeleteId))
      addToast('success', '已删除')
      setConfirmDeleteId(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '删除失败'
      addToast('error', msg)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <ProfileSubPageLayout
      title="我的发布"
      extra={!loading && (
        <span className="text-sm text-gray-400">共 <span className="font-num text-coral-500 font-semibold">{posts.length}</span> 篇</span>
      )}
    >
      {loading ? (
        <GridSkeleton />
      ) : posts.length === 0 ? (
        <EmptyState
          title="还没有发布买家秀"
          hint="去「发布」分享你的好物吧"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {posts.map((post, i) => (
            <div key={post.id} className="relative">
              <PostCard post={post} index={i} />
              {/* 作者操作浮层：编辑/删除 */}
              <div className="absolute top-2 left-2 flex gap-1.5 z-10">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(post.id) }}
                  aria-label="编辑此帖子"
                  className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-600 hover:text-coral-500 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDeleteId(post.id) }}
                  aria-label="删除此帖子"
                  className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-600 hover:text-coral-500 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2" />
                  </svg>
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 删除确认弹窗 */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center px-8"
            onClick={() => !deleting && setConfirmDeleteId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-coral-100 flex items-center justify-center mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.8" strokeLinecap="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-gray-800 mb-1">确认删除？</h2>
                <p className="text-xs text-gray-400 mb-5">删除后无法恢复，确定要删除这条买家秀吗？</p>
                <div className="flex gap-3 w-full">
                  <button
                    disabled={deleting}
                    onClick={() => setConfirmDeleteId(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-60"
                  >
                    取消
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    disabled={deleting}
                    onClick={handleDelete}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-coral-500 shadow-md shadow-coral-200/50 disabled:opacity-60"
                  >
                    {deleting ? '删除中...' : '确认删除'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ProfileSubPageLayout>
  )
}
