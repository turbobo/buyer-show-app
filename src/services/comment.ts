import { supabase } from '@/lib/supabase'
import type { Post, Comment } from '@/types'

// ─── 评论 ───

/** 拉取帖子下所有评论（按时间正序） */
export async function fetchPostComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*, user:profiles!comments_user_id_fkey(nickname, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`获取评论失败: ${error.message}`)
  return (data ?? []) as Comment[]
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

/** 获取当前用户发表的评论列表（附带原帖摘要，仅返回 active 帖子） */
export async function fetchUserComments(userId: string): Promise<Array<Comment & { post?: Pick<Post, 'id' | 'title' | 'images'> }>> {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:profiles!comments_user_id_fkey(nickname, avatar_url),
      post:posts!comments_post_id_fkey(id, title, images, status)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw new Error(`获取评论失败: ${error.message}`)

  return (data ?? [])
    .filter((c: { post: { status: string } | null }) => c.post && c.post.status === 'active')
    .map((c: Comment & { post: { id: string; title: string; images: string[] } }) => ({
      ...c,
      post: { id: c.post.id, title: c.post.title, images: c.post.images },
    })) as Array<Comment & { post?: Pick<Post, 'id' | 'title' | 'images'> }>
}

/**
 * 拉取当前用户在评论过的帖子（按帖聚合），每条返回 { post, comments }。
 * 用于 /profile/comments 的「按帖聚合」Tab。
 */
export async function fetchUserCommentsGroupedByPost(userId: string): Promise<
  Array<{ post: Pick<Post, 'id' | 'title' | 'images'>; comments: Comment[] }>
> {
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*, post:posts!comments_post_id_fkey(id, title, images, user_id, status)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`获取评论失败: ${error.message}`)

  const map = new Map<string, { post: Pick<Post, 'id' | 'title' | 'images'>; comments: Comment[] }>()
  for (const c of (comments ?? []) as Comment[]) {
    const postId = c.post_id
    if (!map.has(postId)) {
      const rawPost = (c as unknown as { post?: Pick<Post, 'id' | 'title' | 'images' | 'user_id' | 'status'> }).post
      if (!rawPost || rawPost.status !== 'active') continue
      map.set(postId, {
        post: { id: rawPost.id, title: rawPost.title, images: rawPost.images },
        comments: [],
      })
    } else if ((c as unknown as { post?: { status?: string } }).post?.status !== 'active') {
      continue
    }
    map.get(postId)!.comments.push(c)
  }
  return Array.from(map.values())
}
