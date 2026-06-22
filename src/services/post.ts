import { supabase } from '@/lib/supabase'
import type { Post, Comment, User, PaginatedResponse, CreatePostParams } from '@/types'

const PAGE_SIZE = 20

// ─── 帖子 ───

/** 获取帖子列表（分页 + 标签筛选） */
export async function fetchPosts(
  page: number,
  tag?: string,
): Promise<PaginatedResponse<Post>> {
  let query = supabase
    .from('posts')
    .select('*, user:profiles!posts_user_id_fkey(nickname, avatar_url)', { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (tag) {
    query = query.contains('tags', [tag])
  }

  const { data, error, count } = await query

  if (error) throw new Error(`获取帖子失败: ${error.message}`)

  const total = count ?? 0
  return {
    list: (data ?? []) as Post[],
    total,
    hasMore: page * PAGE_SIZE < total,
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

  // 获取评论列表
  const { data: comments } = await supabase
    .from('comments')
    .select('*, user:profiles!comments_user_id_fkey(nickname, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  return {
    post: post as Post,
    comments: (comments ?? []) as Comment[],
  }
}

/** 发布帖子 */
export async function createPost(params: CreatePostParams): Promise<Post> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const { data, error } = await supabase
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
    .select()
    .single()

  if (error) throw new Error(`发布失败: ${error.message}`)
  return data as Post
}

/** 删除帖子 */
export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', postId)
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

/** 发表评论 */
export async function addComment(postId: string, content: string): Promise<Comment> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, user_id: user.id, content })
    .select('*, user:profiles!comments_user_id_fkey(nickname, avatar_url)')
    .single()

  if (error) throw new Error(`评论失败: ${error.message}`)
  return data as Comment
}

// ─── 用户 ───

/** 获取当前用户资料 */
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

/** 更新用户资料 */
export async function updateProfile(updates: Partial<Pick<User, 'nickname' | 'avatar_url' | 'bio'>>): Promise<User> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

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
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) throw new Error(`获取用户帖子失败: ${error.message}`)
  return (data ?? []) as Post[]
}

// ─── 关注 ───

/** 切换关注 */
export async function toggleFollow(targetUserId: string): Promise<{ following: boolean }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle()

  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id)
  } else {
    await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId })
  }

  return { following: !existing }
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

/** 搜索帖子 */
export async function searchPosts(keyword: string, page: number = 1): Promise<PaginatedResponse<Post>> {
  const { data, error, count } = await supabase
    .from('posts')
    .select('*, user:profiles!posts_user_id_fkey(nickname, avatar_url)', { count: 'exact' })
    .eq('status', 'active')
    .or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%,product_name.ilike.%${keyword}%`)
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
