'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Comment } from '@/types'
import { toggleCommentFavorite } from '@/services/favorite'
import { useAuthGuard } from '@/hooks/useAuthGuard'

interface Props {
  comment: Comment
  currentUserId?: string
  initialFavorited?: boolean
  depth?: number
  onToggle?: (favorited: boolean) => void
  onDelete?: (commentId: string) => void
  onReply?: (comment: Comment) => void
}

function formatTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

export default function CommentItem({
  comment,
  currentUserId,
  initialFavorited,
  depth = 0,
  onToggle,
  onDelete,
  onReply,
}: Props) {
  const { guard } = useAuthGuard()
  const [favorited, setFavorited] = useState(initialFavorited ?? false)
  const [count, setCount] = useState(comment.favorite_count ?? 0)

  const isOwner = currentUserId === comment.user_id
  const replies = comment.replies ?? []

  const handleFavorite = async () => {
    guard(async () => {
      const res = await toggleCommentFavorite(comment.id)
      setFavorited(res.favorited)
      setCount(res.favorite_count)
      onToggle?.(res.favorited)
    }, '收藏评论')
  }

  return (
    <div>
      <div className="flex gap-3 py-3">
        <img
          src={comment.user?.avatar_url || ''}
          alt=""
          loading="lazy"
          className={`rounded-full object-cover shrink-0 mt-0.5 ${depth === 0 ? 'w-8 h-8' : 'w-6 h-6'}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-700 truncate">
              {comment.user?.nickname || '匿名'}
            </span>
            <span className="text-[10px] text-gray-400">{formatTime(comment.created_at)}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{comment.content}</p>

          {/* 操作栏 */}
          <div className="flex items-center gap-3 mt-1.5">
            <button
              onClick={() => onReply?.(comment)}
              className="text-[11px] text-gray-400 hover:text-coral-500 transition-colors"
              aria-label="回复评论"
            >
              回复
            </button>
            {isOwner && (
              <button
                onClick={() => onDelete?.(comment.id)}
                className="text-[11px] text-gray-400 hover:text-red-500 transition-colors"
                aria-label="删除评论"
              >
                删除
              </button>
            )}
          </div>
        </div>

        {/* 收藏按钮 */}
        <motion.button
          whileTap={{ scale: 0.82 }}
          onClick={handleFavorite}
          aria-label={favorited ? '取消收藏评论' : '收藏评论'}
          className={`shrink-0 self-start mt-1 flex items-center gap-1 px-1.5 py-1 rounded-full transition-colors ${
            favorited ? 'text-coral-500' : 'text-gray-300 hover:text-gray-400'
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={favorited ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
          {count > 0 && <span className="text-[11px] font-num">{count}</span>}
        </motion.button>
      </div>

      {/* 嵌套回复 */}
      {depth === 0 && replies.length > 0 && (
        <div className="ml-11 border-l-2 border-gray-100 pl-3">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              depth={1}
              onDelete={onDelete}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  )
}
