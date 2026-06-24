import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  fetchPostDetail,
  toggleLike as toggleLikeApi,
  toggleFavorite as toggleFavoriteApi,
  checkPostLiked,
  checkPostFavorited,
} from '@/services/post'
import { addComment as addCommentApi, deleteComment as deleteCommentApi } from '@/services/comment'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'
import type { Post, Comment } from '@/types'

export interface ReplyTarget {
  commentId: string
  nickname: string
}

export function usePostDetail() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const { guard } = useAuthGuard()
  const currentUser = useUserStore((s) => s.user)
  const addToast = useUIStore((s) => s.addToast)

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteCount, setFavoriteCount] = useState(0)
  const [heartBeat, setHeartBeat] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null)

  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!postId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const res = await fetchPostDetail(postId)
        if (cancelled) return
        setPost(res.post)
        setLikeCount(res.post.like_count)
        setFavoriteCount(res.post.favorite_count ?? 0)
        setComments(res.comments)
        setIsLiked(false)
        checkPostLiked(postId).then((liked) => {
          if (!cancelled) setIsLiked(liked)
        })
        checkPostFavorited(postId).then((fav) => {
          if (!cancelled) setIsFavorited(fav)
        })
      } catch (err: unknown) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : '加载失败'
          addToast('error', msg)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [postId, addToast])

  const handleCarouselScroll = useCallback(() => {
    const el = carouselRef.current
    if (!el || !post) return
    const idx = Math.round(el.scrollLeft / el.offsetWidth)
    setCurrentSlide(Math.min(idx, post.images.length - 1))
  }, [post])

  const handleToggleLike = async () => {
    try {
      const res = await toggleLikeApi(postId)
      setIsLiked(res.liked)
      setLikeCount(res.like_count)
      if (res.liked) {
        setHeartBeat(true)
        setTimeout(() => setHeartBeat(false), 600)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '操作失败'
      addToast('error', msg)
    }
  }

  const handleToggleFavorite = async () => {
    try {
      const res = await toggleFavoriteApi(postId)
      setIsFavorited(res.favorited)
      setFavoriteCount(res.favorite_count)
      addToast('success', res.favorited ? '已收藏' : '已取消收藏')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '操作失败'
      addToast('error', msg)
    }
  }

  const handleSubmitComment = async () => {
    const text = commentText.trim()
    if (!text || submittingComment) return

    setSubmittingComment(true)
    try {
      const parentId = replyTarget?.commentId
      const newComment = await addCommentApi(postId, text, parentId)
      if (parentId) {
        setComments((prev) =>
          prev.map((topComment) => {
            if (topComment.id === parentId) {
              return {
                ...topComment,
                replies: [...(topComment.replies ?? []), newComment],
                reply_count: (topComment.reply_count ?? 0) + 1,
              }
            }
            return topComment
          }),
        )
      } else {
        setComments((prev) => [...prev, { ...newComment, replies: [] }])
      }
      setCommentText('')
      setReplyTarget(null)
      if (post) {
        setPost({ ...post, comment_count: post.comment_count + 1 })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '评论失败'
      addToast('error', msg)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    useUIStore.getState().openModal({
      title: '删除评论？',
      description: '删除后无法恢复。',
      confirmText: '确认删除',
      confirmDanger: true,
      onConfirm: async () => {
        try {
          await deleteCommentApi(commentId)
          let deletedCount = 1
          setComments((prev) => {
            const filtered: Comment[] = []
            for (const topComment of prev) {
              if (topComment.id === commentId) {
                deletedCount += topComment.replies?.length ?? 0
                continue
              }
              const filteredReplies = (topComment.replies ?? []).filter(
                (reply) => reply.id !== commentId,
              )
              if (filteredReplies.length < (topComment.replies?.length ?? 0)) {
                filtered.push({
                  ...topComment,
                  replies: filteredReplies,
                  reply_count: filteredReplies.length,
                })
              } else {
                filtered.push(topComment)
              }
            }
            return filtered
          })
          if (post) {
            setPost({ ...post, comment_count: Math.max(0, post.comment_count - deletedCount) })
          }
          addToast('success', '评论已删除')
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : '删除失败'
          addToast('error', msg)
        }
      },
    })
  }

  const handleReply = useCallback((comment: Comment) => {
    setReplyTarget({
      commentId: comment.parent_id ?? comment.id,
      nickname: comment.user?.nickname ?? '匿名',
    })
  }, [])

  const handleCancelReply = useCallback(() => {
    setReplyTarget(null)
  }, [])

  return {
    post,
    loading,
    router,
    isLiked,
    likeCount,
    isFavorited,
    favoriteCount,
    heartBeat,
    currentSlide,
    comments,
    commentText,
    setCommentText,
    submittingComment,
    carouselRef,
    guard,
    currentUser,
    replyTarget,
    handleCarouselScroll,
    handleToggleLike,
    handleToggleFavorite,
    handleSubmitComment,
    handleDeleteComment,
    handleReply,
    handleCancelReply,
  }
}
