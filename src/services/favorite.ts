import { supabase } from '@/lib/supabase'
import type { Comment, Post } from '@/types'

// ─── 帖子收藏（沿用 favorites 表） ───

export async function fetchUserFavorites(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      created_at,
      post:posts!favorites_post_id_fkey(
        *,
        user:profiles!posts_user_id_fkey(nickname, avatar_url)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`获取收藏帖子失败: ${error.message}`)
  return (data ?? [])
    .map((row) => (row as unknown as { post?: Post }).post)
    .filter((p): p is Post => Boolean(p))
}

// ─── 评论收藏 ───

/** 切换评论收藏 */
export async function toggleCommentFavorite(
  commentId: string,
): Promise<{ favorited: boolean; favorite_count: number }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const { data: existing } = await supabase
    .from('favorite_comments')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('favorite_comments')
      .delete()
      .eq('id', existing.id)
    if (error) throw new Error(`取消收藏失败: ${error.message}`)
  } else {
    const { error } = await supabase
      .from('favorite_comments')
      .insert({ comment_id: commentId, user_id: user.id })
    if (error) throw new Error(`收藏失败: ${error.message}`)
  }

  const { data: row } = await supabase
    .from('comments')
    .select('favorite_count')
    .eq('id', commentId)
    .single()

  return { favorited: !existing, favorite_count: row?.favorite_count ?? 0 }
}

/** 检查当前用户是否已收藏评论 */
export async function checkCommentFavorited(commentId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('favorite_comments')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .maybeSingle()

  return Boolean(data)
}

/** 拉取当前用户收藏的评论列表（带帖子信息） */
export async function fetchUserFavoriteComments(userId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('favorite_comments')
    .select(`
      created_at,
      comment:comments!favorite_comments_comment_id_fkey(
        *,
        user:profiles!comments_user_id_fkey(nickname, avatar_url)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`获取收藏评论失败: ${error.message}`)
  return (data ?? [])
    .map((row) => (row as unknown as { comment?: Comment }).comment)
    .filter((c): c is Comment => Boolean(c))
}

// ─── 标签收藏 ───

/** 切换标签收藏 */
export async function toggleTagFavorite(
  tag: string,
): Promise<{ favorited: boolean }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const trimmed = tag.trim()
  if (!trimmed) throw new Error('标签不能为空')

  const { data: existing } = await supabase
    .from('favorite_tags')
    .select('id')
    .eq('tag', trimmed)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('favorite_tags')
      .delete()
      .eq('id', existing.id)
    if (error) throw new Error(`取消收藏失败: ${error.message}`)
  } else {
    const { error } = await supabase
      .from('favorite_tags')
      .insert({ tag: trimmed, user_id: user.id })
    if (error) throw new Error(`收藏失败: ${error.message}`)
  }

  return { favorited: !existing }
}

/** 获取当前用户收藏的标签（按收藏时间倒序） */
export async function fetchUserFavoriteTags(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('favorite_tags')
    .select('tag')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`获取收藏标签失败: ${error.message}`)
  return (data ?? []).map((row) => (row as { tag: string }).tag)
}

/** 批量查询当前用户已收藏的标签（用于标签云高亮） */
export async function fetchUserFavoriteTagSet(userId: string): Promise<Set<string>> {
  const list = await fetchUserFavoriteTags(userId)
  return new Set(list)
}
