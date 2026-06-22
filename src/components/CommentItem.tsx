import type { Comment } from '@/types'

interface Props {
  comment: Comment
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
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export default function CommentItem({ comment }: Props) {
  return (
    <div className="flex gap-3 py-3">
      <img
        src={comment.user?.avatar_url || ''}
        alt=""
        className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-700 truncate">
            {comment.user?.nickname || '匿名'}
          </span>
          <span className="text-[10px] text-gray-400">{formatTime(comment.created_at)}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{comment.content}</p>
      </div>
    </div>
  )
}
