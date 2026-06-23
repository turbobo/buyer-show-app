'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user'
import { fetchUserPosts } from '@/services/post'
import PostCard from '@/components/PostCard'
import ProfileSubPageLayout, { EmptyState, GridSkeleton } from '@/components/layout/ProfileSubPageLayout'
import type { Post } from '@/types'

export default function MyPostsPage() {
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
    fetchUserPosts(user.id)
      .then(setPosts)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [authReady, isLoggedIn, user, router])

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
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}
    </ProfileSubPageLayout>
  )
}
