import { supabase } from '@/lib/supabase'

const MAX_HISTORY = 5

/** 获取当前用户的搜索历史（最近 N 条，去重） */
export async function fetchSearchHistory(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('search_history')
    .select('keyword')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(MAX_HISTORY)

  if (!data) return []
  return Array.from(new Set(data.map((d) => d.keyword)))
}

/** 保存搜索关键词到历史记录 */
export async function saveSearchKeyword(userId: string, keyword: string): Promise<void> {
  await supabase.from('search_history').insert({
    user_id: userId,
    keyword,
  })
}

/** 清空当前用户的全部搜索历史 */
export async function clearSearchHistory(userId: string): Promise<void> {
  await supabase.from('search_history').delete().eq('user_id', userId)
}
