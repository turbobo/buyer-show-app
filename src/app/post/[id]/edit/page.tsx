import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { POST_STATUS } from '@/lib/constants'
import EditPostClient from './client'

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(url, key)
}

// 编辑页与详情页共用同一组帖子 id
export async function generateStaticParams() {
  try {
    const supabase = getServerSupabase()
    const { data } = await supabase
      .from('posts')
      .select('id')
      .eq('status', POST_STATUS.ACTIVE)
      .limit(100)
    return (data ?? []).map((p) => ({ id: p.id }))
  } catch {
    return []
  }
}

export const metadata: Metadata = {
  title: '编辑买家秀 - 买家说',
}

export default function EditPostPage() {
  return <EditPostClient />
}
