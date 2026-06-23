import { supabase } from '@/lib/supabase'
import { POST_STATUS } from '@/lib/constants'
import type { Post, User } from '@/types'

// ─── 用户 ───

/** 获取当前登录用户的资料 */
export async function fetchCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return null
  return data as User
}

/** 校验昵称是否可用（去重）。空字符串/纯空白视为不可用。 */
export async function isNicknameAvailable(
  nickname: string,
  excludeUserId?: string,
): Promise<boolean> {
  const trimmed = nickname.trim()
  if (!trimmed) return false

  let query = supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('nickname', trimmed)

  if (excludeUserId) query = query.neq('id', excludeUserId)

  const { count, error } = await query
  if (error) throw new Error(`昵称校验失败: ${error.message}`)
  return (count ?? 0) === 0
}

/** 更新用户资料（昵称会做唯一性校验） */
export async function updateProfile(
  updates: Partial<Pick<User, 'nickname' | 'avatar_url' | 'bio'>>,
): Promise<User> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  // 昵称：长度 + 唯一性
  if (updates.nickname !== undefined) {
    const nickname = updates.nickname.trim()
    if (nickname.length < 2 || nickname.length > 20) {
      throw new Error('昵称需 2-20 字')
    }
    const available = await isNicknameAvailable(nickname, user.id)
    if (!available) throw new Error('该昵称已被使用')
    updates.nickname = nickname
  }

  // 简介长度
  if (updates.bio !== undefined && updates.bio.length > 200) {
    throw new Error('个人简介不超过 200 字')
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw new Error(`更新失败: ${error.message}`)
  return data as User
}

/** 获取用户发布的帖子 */
export async function fetchUserPosts(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*, user:profiles!posts_user_id_fkey(nickname, avatar_url)')
    .eq('user_id', userId)
    .eq('status', POST_STATUS.ACTIVE)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`获取用户帖子失败: ${error.message}`)
  return (data ?? []) as Post[]
}

/**
 * 软注销账号：将本人帖子置为 deleted、profile 标记匿名占位、登出会话。
 * 真正销毁 auth.users 行需要 service_role（应在后端 Edge Function 中执行）。
 * 这里只承担客户端能做的部分，并在 service 层显式抛错说明限制。
 */
export async function deleteAccount(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  // 1) 隐藏所有帖子（status=deleted），保留外键完整性的同时让前台不可见
  const { error: postsErr } = await supabase
    .from('posts')
    .update({ status: POST_STATUS.DELETED })
    .eq('user_id', user.id)
  if (postsErr) throw new Error(`清理帖子失败: ${postsErr.message}`)

  // 2) profile 改为匿名占位（不真正删行：避免连带级联触发计数错误）
  const placeholder = `已注销用户_${user.id.slice(0, 6)}`
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ nickname: placeholder, avatar_url: '', bio: '' })
    .eq('id', user.id)
  if (profileErr) throw new Error(`清理资料失败: ${profileErr.message}`)

  // 3) 登出客户端会话；auth.users 行的彻底删除请放服务端 Edge Function
  await supabase.auth.signOut()
}
