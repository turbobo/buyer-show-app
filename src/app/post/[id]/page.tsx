import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import PostDetailClient from './client'

// 服务端直接创建 Supabase 客户端（不依赖 NEXT_PUBLIC_ 变量）
function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(url, key)
}

export async function generateStaticParams() {
  try {
    const supabase = getServerSupabase()
    const { data } = await supabase
      .from('posts')
      .select('id')
      .eq('status', 'active')
      .limit(100)
    return (data ?? []).map((p) => ({ id: p.id }))
  } catch {
    return []
  }
}

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const supabase = getServerSupabase()
    const { data: post } = await supabase
      .from('posts')
      .select('*, user:profiles!posts_user_id_fkey(nickname, avatar_url)')
      .eq('id', params.id)
      .single()

    if (!post) {
      return { title: '帖子不存在 - 买家说' }
    }

    const description = post.content?.slice(0, 120) || ''
    const ogImage = post.images?.[0] || ''

    return {
      title: `${post.title} - 买家说`,
      description,
      openGraph: {
        title: post.title,
        description: post.content?.slice(0, 80) || '',
        type: 'article',
        images: ogImage ? [{ url: ogImage, width: 400, height: 300 }] : [],
        publishedTime: post.created_at,
        authors: post.user?.nickname ? [post.user.nickname] : [],
        tags: post.tags || [],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.content?.slice(0, 80) || '',
        images: ogImage ? [ogImage] : [],
      },
    }
  } catch {
    return { title: '买家说' }
  }
}

export default function PostDetailPage() {
  return <PostDetailClient />
}
