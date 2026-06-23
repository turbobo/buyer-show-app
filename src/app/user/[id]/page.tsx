import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import UserDetailClient from './client'
import { USER_STATUS } from '@/lib/constants'

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(url, key)
}

export async function generateStaticParams() {
  try {
    const supabase = getServerSupabase()
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('status', USER_STATUS.ACTIVE)
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
    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname, bio, avatar_url')
      .eq('id', params.id)
      .single()

    if (!profile) {
      return { title: '用户不存在 - 买家说' }
    }

    return {
      title: `${profile.nickname} - 买家说`,
      description: profile.bio || `${profile.nickname} 在买家说的个人页`,
      openGraph: {
        title: profile.nickname,
        description: profile.bio || '',
        type: 'profile',
        images: profile.avatar_url ? [{ url: profile.avatar_url }] : [],
      },
    }
  } catch {
    return { title: '买家说' }
  }
}

export default function UserDetailPage() {
  return <UserDetailClient />
}
