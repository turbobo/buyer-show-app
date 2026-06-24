import { supabase } from '@/lib/supabase'
import { POST_STATUS } from '@/lib/constants'
import { fetchPostComments } from '@/services/comment'
import type { Post, Comment, PaginatedResponse, CreatePostParams } from '@/types'

const PAGE_SIZE = 20

// ─── 帖子 ───

/** 获取帖子列表（分页 + 标签筛选） */
export async function fetchPosts(
  page: number,
  tag?: string,
): Promise<PaginatedResponse<Post>> {
  let query = supabase
    .from('posts')
    .select('*, user:profiles!posts_user_id_fkey(nickname, avatar_url)')
    .eq('status', POST_STATUS.ACTIVE)
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (tag) {
    query = query.contains('tags', [tag])
  }

  const { data, error } = await query

  if (error) throw new Error(`获取帖子失败: ${error.message}`)

  const rows = (data ?? []) as Post[]
  const hasMore = rows.length > PAGE_SIZE
  const list = hasMore ? rows.slice(0, PAGE_SIZE) : rows

  return {
    list,
    total: 0,
    hasMore,
    page,
  }
}

/** 获取帖子详情（含评论） */
export async function fetchPostDetail(postId: string): Promise<{
  post: Post
  comments: Comment[]
}> {
  // 获取帖子 + 作者信息
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('*, user:profiles!posts_user_id_fkey(nickname, avatar_url)')
    .eq('id', postId)
    .single()

  if (postError || !post) throw new Error('帖子不存在')

  const comments = await fetchPostComments(postId)

  return {
    post: post as Post,
    comments,
  }
}

/** 发布帖子 */
export async function createPost(params: CreatePostParams): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const { error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      title: params.title,
      content: params.content,
      images: params.images,
      tags: params.tags ?? [],
      product_name: params.product_name ?? '',
      price: params.price ?? '',
      rating: params.rating ?? 5,
    })

  if (error) throw new Error(`发布失败: ${error.message}`)
}

/** 更新帖子（作者本人才可修改） */
export async function updatePost(
  postId: string,
  params: Partial<CreatePostParams>,
): Promise<Post> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  // 拉取原帖以校验归属（避免越权）
  const { data: existing, error: fetchError } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single()

  if (fetchError || !existing) throw new Error('帖子不存在')
  if (existing.user_id !== user.id) throw new Error('无权修改此帖子')

  // 仅传入字段会被更新，避免误清空
  const updates: Record<string, unknown> = {}
  if (params.title !== undefined) updates.title = params.title
  if (params.content !== undefined) updates.content = params.content
  if (params.images !== undefined) updates.images = params.images
  if (params.tags !== undefined) updates.tags = params.tags
  if (params.product_name !== undefined) updates.product_name = params.product_name
  if (params.price !== undefined) updates.price = params.price
  if (params.rating !== undefined) updates.rating = params.rating

  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .eq('user_id', user.id) // 双重保险：让 RLS/SQL 一起兜底
    .select('*, user:profiles!posts_user_id_fkey(nickname, avatar_url)')
    .single()

  if (error) throw new Error(`更新失败: ${error.message}`)
  return data as Post
}

/** 删除帖子（作者本人才可删除） */
export async function deletePost(postId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const { data: existing, error: fetchError } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single()

  if (fetchError || !existing) throw new Error('帖子不存在')
  if (existing.user_id !== user.id) throw new Error('无权删除此帖子')

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id)
  if (error) throw new Error(`删除失败: ${error.message}`)
}

// ─── 互动 ───

/** 切换点赞（toggle） */
export async function toggleLike(postId: string): Promise<{ liked: boolean; like_count: number }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  // 检查是否已点赞
  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    // 取消点赞
    await supabase.from('likes').delete().eq('id', existing.id)
  } else {
    // 点赞
    await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
  }

  // 获取最新点赞数
  const { data: post } = await supabase
    .from('posts')
    .select('like_count')
    .eq('id', postId)
    .single()

  return { liked: !existing, like_count: post?.like_count ?? 0 }
}

/** 检查当前用户是否已点赞帖子 */
export async function checkPostLiked(postId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  return Boolean(data)
}

/** 获取用户点赞过的帖子列表 */
export async function fetchUserLikedPosts(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('likes')
    .select(`
      created_at,
      post:posts!likes_post_id_fkey(
        *,
        user:profiles!posts_user_id_fkey(nickname, avatar_url)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`获取点赞帖子失败: ${error.message}`)
  return (data ?? [])
    .map((row) => (row as unknown as { post?: Post }).post)
    .filter((p): p is Post => Boolean(p))
}

// ─── 收藏 ───

/** 切换收藏 */
export async function toggleFavorite(postId: string): Promise<{ favorited: boolean; favorite_count: number }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id)
  } else {
    await supabase.from('favorites').insert({ post_id: postId, user_id: user.id })
  }

  // 触发器已自动更新 posts.favorite_count
  const { data: post } = await supabase
    .from('posts')
    .select('favorite_count')
    .eq('id', postId)
    .single()

  return { favorited: !existing, favorite_count: post?.favorite_count ?? 0 }
}

/** 检查当前用户是否已收藏帖子 */
export async function checkPostFavorited(postId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  return Boolean(data)
}

// ─── 图片上传 ───

/** 上传图片到 Supabase Storage */
export async function uploadImage(file: File, folder: string = 'posts'): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const ext = file.name.split('.').pop() || 'webp'
  const path = `${folder}/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error } = await supabase.storage.from('posts').upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
  })

  if (error) throw new Error(`上传失败: ${error.message}`)

  const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(path)
  return publicUrl
}

// ─── 搜索 ───

/**
 * 搜索帖子
 *
 * 匹配字段：
 * - title / content / product_name：ILIKE 模糊匹配（部分包含）
 * - tags：数组完全包含（cs，整段标签匹配，如 "数码"）
 *
 * 注：PostgREST 的 or 表达式以逗号分隔，关键词中的逗号/括号会破坏表达式，
 * 这里做最小转义，过滤掉 ',', '(', ')'。
 */
export async function searchPosts(keyword: string, page: number = 1): Promise<PaginatedResponse<Post>> {
  const safe = keyword.replace(/[,()]/g, '').trim()
  if (!safe) {
    return { list: [], total: 0, hasMore: false, page }
  }

  const { data, error, count } = await supabase
    .from('posts')
    .select('*, user:profiles!posts_user_id_fkey(nickname, avatar_url)', { count: 'estimated' })
    .eq('status', POST_STATUS.ACTIVE)
    .or(
      [
        `title.ilike.%${safe}%`,
        `content.ilike.%${safe}%`,
        `product_name.ilike.%${safe}%`,
        `tags.cs.{${safe}}`,
      ].join(',')
    )
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (error) throw new Error(`搜索失败: ${error.message}`)

  const total = count ?? 0
  return {
    list: (data ?? []) as Post[],
    total,
    hasMore: page * PAGE_SIZE < total,
    page,
  }
}
