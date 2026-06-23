import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

/** 关注他人 */
export async function followUser(targetUserId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')
  if (user.id === targetUserId) throw new Error('不能关注自己')

  const { error } = await supabase.from('follows').insert({
    follower_id: user.id,
    following_id: targetUserId,
  })
  // 23505 = unique_violation：已经关注过，幂等忽略
  if (error && error.code !== '23505') {
    throw new Error(`关注失败: ${error.message}`)
  }
}

/** 取关 */
export async function unfollowUser(targetUserId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
  if (error) throw new Error(`取消关注失败: ${error.message}`)
}

/** 切换关注状态（关注 ↔ 取关） */
export async function toggleFollow(targetUserId: string): Promise<{ following: boolean }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')
  if (user.id === targetUserId) throw new Error('不能关注自己')

  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle()

  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id)
  } else {
    await supabase.from('follows').insert({
      follower_id: user.id,
      following_id: targetUserId,
    })
  }

  return { following: !existing }
}

/** 当前登录用户是否已关注 targetUserId */
export async function isFollowing(targetUserId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle()

  return Boolean(data)
}

/** 拉取某用户的粉丝列表（关注该用户的人） */
export async function fetchFollowers(userId: string): Promise<User[]> {
  const { data, error } = await supabase
    .from('follows')
    .select(`
      follower:follower_id(
        id,
        nickname,
        avatar_url,
        bio,
        post_count,
        follower_count,
        following_count,
        role,
        status
      )
    `)
    .eq('following_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`获取粉丝列表失败: ${error.message}`)
  return (data ?? [])
    .map((row) => (row as unknown as { follower?: User }).follower)
    .filter((u): u is User => Boolean(u))
}

/** 拉取某用户的关注列表（该用户关注的人） */
export async function fetchFollowing(userId: string): Promise<User[]> {
  const { data, error } = await supabase
    .from('follows')
    .select(`
      following:following_id(
        id,
        nickname,
        avatar_url,
        bio,
        post_count,
        follower_count,
        following_count,
        role,
        status
      )
    `)
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`获取关注列表失败: ${error.message}`)
  return (data ?? [])
    .map((row) => (row as unknown as { following?: User }).following)
    .filter((u): u is User => Boolean(u))
}

/** 获取某用户的 关注数 / 粉丝数（用于他人主页展示） */
export async function fetchFollowCounts(
  userId: string,
): Promise<{ follower_count: number; following_count: number }> {
  const { data, error } = await supabase
    .from('profiles')
    .select('follower_count, following_count')
    .eq('id', userId)
    .single()

  if (error) throw new Error(`获取关注数失败: ${error.message}`)
  return {
    follower_count: data?.follower_count ?? 0,
    following_count: data?.following_count ?? 0,
  }
}
