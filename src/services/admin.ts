import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/user'
import type { User } from '@/types'

const ADMIN_PAGE_SIZE = 20

/** 管理员后台：分页 + 搜索用户列表 */
export async function adminFetchUsers(
  page: number,
  search?: string,
): Promise<{ list: User[]; total: number; hasMore: boolean; page: number }> {
  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE - 1)

  const safe = search?.trim()
  if (safe) {
    query = query.or(`nickname.ilike.%${safe}%,id.eq.${safe}`)
  }

  const { data, error, count } = await query
  if (error) throw new Error(`获取用户列表失败: ${error.message}`)

  const total = count ?? 0
  return {
    list: (data ?? []) as User[],
    total,
    hasMore: page * ADMIN_PAGE_SIZE < total,
    page,
  }
}

/** 管理员后台：提权（自举 / 提他人） */
export async function adminPromote(targetUserId: string): Promise<void> {
  const { error } = await supabase.rpc('promote_to_admin', { target_uid: targetUserId })
  if (error) throw new Error(`提权失败: ${error.message}`)
}

/** 管理员后台：封禁用户（连带隐藏其 active 帖子） */
export async function adminBan(targetUserId: string): Promise<void> {
  const { error } = await supabase.rpc('ban_user', { target_uid: targetUserId })
  if (error) throw new Error(`封禁失败: ${error.message}`)
}

/** 管理员后台：解封用户 */
export async function adminUnban(targetUserId: string): Promise<void> {
  const { error } = await supabase.rpc('unban_user', { target_uid: targetUserId })
  if (error) throw new Error(`解封失败: ${error.message}`)
}

/** 判断当前用户是否是管理员（前端快速判断用；真正权限在服务端 RPC 内校验） */
export function isCurrentUserAdmin(): boolean {
  return useUserStore.getState().user?.role === 'admin'
}

// ─── 标签管理 ───

export interface AdminTag {
  id: string
  name: string
  description: string
  status: 'active' | 'archived' | 'deleted'
  /** 引用该标签的 active 帖子数（JOIN 计算） */
  usage_count: number
  created_at: string
  updated_at: string
}

/** 管理员后台：获取标签列表（含引用计数） */
export async function adminFetchTags(
  page: number,
  search?: string,
): Promise<{ list: AdminTag[]; total: number; hasMore: boolean; page: number }> {
  let query = supabase
    .from('tags')
    .select('*', { count: 'exact' })
    .neq('status', 'deleted')
    .order('created_at', { ascending: false })
    .range((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE - 1)

  const safe = search?.trim()
  if (safe) {
    query = query.ilike('name', `%${safe}%`)
  }

  const { data, error, count } = await query
  if (error) throw new Error(`获取标签列表失败: ${error.message}`)

  const tags = (data ?? []) as AdminTag[]

  // 并行查每个 tag 的引用数（cs 操作符要求数组整段包含）
  const usageCounts = await Promise.all(
    tags.map(async (tag) => {
      const { count: c } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active')
        .contains('tags', [tag.name])
      return { name: tag.name, count: c ?? 0 }
    }),
  )
  const countMap = new Map(usageCounts.map((u) => [u.name, u.count]))

  const list = tags.map((t) => ({ ...t, usage_count: countMap.get(t.name) ?? 0 }))

  const total = count ?? 0
  return {
    list,
    total,
    hasMore: page * ADMIN_PAGE_SIZE < total,
    page,
  }
}

/** 管理员后台：获取所有 active 标签（用于合并目标选择器） */
export async function adminFetchActiveTagOptions(): Promise<Array<{ id: string; name: string }>> {
  const { data, error } = await supabase
    .from('tags')
    .select('id, name')
    .eq('status', 'active')
    .order('name', { ascending: true })
    .limit(200)
  if (error) throw new Error(`获取标签选项失败: ${error.message}`)
  return (data ?? []) as Array<{ id: string; name: string }>
}

export async function adminCreateTag(name: string, description: string = ''): Promise<string> {
  const { data, error } = await supabase.rpc('admin_create_tag', {
    p_name: name,
    p_description: description,
  })
  if (error) throw new Error(`创建标签失败: ${error.message}`)
  return data as string
}

export async function adminRenameTag(tagId: string, newName: string): Promise<void> {
  const { error } = await supabase.rpc('admin_rename_tag', {
    p_tag_id: tagId,
    p_new_name: newName,
  })
  if (error) throw new Error(`重命名失败: ${error.message}`)
}

export async function adminMergeTag(sourceId: string, targetId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_merge_tag', {
    p_source_id: sourceId,
    p_target_id: targetId,
  })
  if (error) throw new Error(`合并失败: ${error.message}`)
}

export async function adminDeleteTag(tagId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_tag', { p_tag_id: tagId })
  if (error) throw new Error(`删除失败: ${error.message}`)
}
