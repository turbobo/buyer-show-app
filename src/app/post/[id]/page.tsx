import { MOCK_POSTS } from '@/lib/mock-data'
import PostDetailClient from './client'

export function generateStaticParams() {
  return MOCK_POSTS.map((post) => ({ id: post.id }))
}

export default function PostDetailPage() {
  return <PostDetailClient />
}
