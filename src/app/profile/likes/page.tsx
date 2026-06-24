'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'
import { fetchUserLikedPosts } from '@/services/post'
import PostCard from '@/components/PostCard'
import ProfileSubPageLayout, { EmptyState, GridSkeleton } from '@/components/layout/ProfileSubPageLayout'
import type { Post } from '@/types'

export default function MyLikesPage() {
  const router = useRouter()
  const { user, isLoggedIn, authReady } = useUserStore()
  const addToast = useUIStore((s) => s.addToast)

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authReady) return
    if (!isLoggedIn || !user) {
      router.replace('/profile')
      return
    }

    let cancelled = false
    setLoading(true)
    fetchUserLikedPosts(user.id)
      .then((data) => {
        if (!cancelled) setPosts(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) addToast('error', err instanceof Error ? err.message : '加载点赞失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [authReady, isLoggedIn, user, router, addToast])

  return (
    <ProfileSubPageLayout
      title="我的点赞"
      extra={!loading && (
        <span className="text-sm text-gray-400">共 <span className="font-num text-coral-500 font-semibold">{posts.length}</span> 项</span>
      )}
    >
      {loading ? (
        <GridSkeleton />
      ) : posts.length === 0 ? (
        <EmptyState
          title="还没有点赞帖子"
          hint="浏览帖子时点击❤️为好内容点赞"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}
    </ProfileSubPageLayout>
  )
}
