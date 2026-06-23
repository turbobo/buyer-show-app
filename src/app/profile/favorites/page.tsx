'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user'
import { fetchUserFavorites } from '@/services/post'
import PostCard from '@/components/PostCard'
import ProfileSubPageLayout, { EmptyState, GridSkeleton } from '@/components/layout/ProfileSubPageLayout'
import type { Post } from '@/types'

export default function MyFavoritesPage() {
  const router = useRouter()
  const { user, isLoggedIn, authReady } = useUserStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authReady) return
    if (!isLoggedIn || !user) {
      router.replace('/profile')
      return
    }
    fetchUserFavorites(user.id)
      .then(setPosts)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [authReady, isLoggedIn, user, router])

  return (
    <ProfileSubPageLayout
      title="我的收藏"
      extra={!loading && (
        <span className="text-sm text-gray-400">共 <span className="font-num text-coral-500 font-semibold">{posts.length}</span> 件</span>
      )}
    >
      {loading ? (
        <GridSkeleton />
      ) : posts.length === 0 ? (
        <EmptyState
          title="还没有收藏内容"
          hint="点击帖子右下角的⭐收藏喜欢的好物"
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
      )}
    </ProfileSubPageLayout>
  )
}
