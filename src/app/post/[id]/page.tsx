import type { Metadata } from 'next'
import { MOCK_POSTS } from '@/lib/mock-data'
import PostDetailClient from './client'

export function generateStaticParams() {
  return MOCK_POSTS.map((post) => ({ id: post.id }))
}

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = MOCK_POSTS.find((p) => p.id === params.id)

  if (!post) {
    return { title: '帖子不存在 - 买家说' }
  }

  const description = post.content.slice(0, 120)
  const ogImage = post.images[0] || ''

  return {
    title: `${post.title} - 买家说`,
    description,
    openGraph: {
      title: post.title,
      description: post.content.slice(0, 80),
      type: 'article',
      images: ogImage ? [{ url: ogImage, width: 400, height: 300 }] : [],
      publishedTime: post.created_at,
      authors: post.user?.nickname ? [post.user.nickname] : [],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.content.slice(0, 80),
      images: ogImage ? [ogImage] : [],
    },
  }
}

export default function PostDetailPage() {
  return <PostDetailClient />
}
