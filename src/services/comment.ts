import { supabase } from '@/lib/supabase'
import { POST_STATUS } from '@/lib/constants'
import type { Post, Comment } from '@/types'

// ─── 评论 ───

/** 拉取帖子下所有评论并组装为树结构（顶级 + replies） */
export async function fetchPostComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*, user:profiles!comments_user_id_fkey(nickname, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`获取评论失败: ${error.message}`)

  const allComments = (data ?? []) as Comment[]
  const topLevel: Comment[] = []
  const childMap = new Map<string, Comment[]>()

  for (const comment of allComments) {
    if (comment.parent_id) {
      const siblings = childMap.get(comment.parent_id) ?? []
      siblings.push(comment)
      childMap.set(comment.parent_id, siblings)
    } else {
      topLevel.push(comment)
    }
  }

  for (const parent of topLevel) {
    parent.replies = childMap.get(parent.id) ?? []
  }

  return topLevel
}

/** 发表评论（支持回复） */
export async function addComment(
  postId: string,
  content: string,
  parentId?: string,
): Promise<Comment> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const insertData: Record<string, unknown> = {
    post_id: postId,
    user_id: user.id,
    content,
  }
  if (parentId) {
    insertData.parent_id = parentId
  }

  const { data, error } = await supabase
    .from('comments')
    .insert(insertData)
    .select('*, user:profiles!comments_user_id_fkey(nickname, avatar_url)')
    .single()

  if (error) throw new Error(`评论失败: ${error.message}`)
  return data as Comment
}

/** 删除评论（RLS 保证只能删除自己的） */
export async function deleteComment(commentId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('请先登录')

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) throw new Error(`删除评论失败: ${error.message}`)
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
    .filter((comment: { post: { status: number } | null }) => comment.post && comment.post.status === POST_STATUS.ACTIVE)
    .map((comment: Comment & { post: { id: string; title: string; images: string[] } }) => ({
      ...comment,
      post: { id: comment.post.id, title: comment.post.title, images: comment.post.images },
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
  for (const comment of (comments ?? []) as Comment[]) {
    const postId = comment.post_id
    if (!map.has(postId)) {
      const rawPost = (comment as unknown as { post?: Pick<Post, 'id' | 'title' | 'images' | 'user_id' | 'status'> }).post
      if (!rawPost || rawPost.status !== POST_STATUS.ACTIVE) continue
      map.set(postId, {
        post: { id: rawPost.id, title: rawPost.title, images: rawPost.images },
        comments: [],
      })
    } else if ((comment as unknown as { post?: { status?: number } }).post?.status !== POST_STATUS.ACTIVE) {
      continue
    }
    map.get(postId)!.comments.push(comment)
  }
  return Array.from(map.values())
}
