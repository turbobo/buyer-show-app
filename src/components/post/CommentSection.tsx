'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp } from '@/lib/animations'
import CommentItem from '@/components/CommentItem'
import type { Comment } from '@/types'
import type { ReplyTarget } from '@/hooks/usePostDetail'

interface Props {
  comments: Comment[]
  currentUserId?: string
  onDelete?: (commentId: string) => void
  onReply?: (comment: Comment) => void
  commentText: string
  setCommentText: (text: string) => void
  submittingComment: boolean
  handleSubmitComment: () => void
  guard: (action: () => void, reason?: string) => void
  replyTarget: ReplyTarget | null
  onCancelReply: () => void
}

export default function CommentSection({
  comments,
  currentUserId,
  onDelete,
  onReply,
  commentText,
  setCommentText,
  submittingComment,
  handleSubmitComment,
  guard,
  replyTarget,
  onCancelReply,
}: Props) {
  const totalCount = comments.reduce(
    (sum, topComment) => sum + 1 + (topComment.replies?.length ?? 0),
    0,
  )

  const canSubmit = commentText.trim().length > 0 && !submittingComment

  return (
    <motion.section
      className="mt-4 bg-white rounded-2xl shadow-card p-5"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={3}
    >
      <h2 className="text-h2 text-gray-800 mb-2">
        评论 <span className="text-body font-normal text-gray-400 font-num">({totalCount})</span>
      </h2>
      {comments.length === 0 ? (
        <div className="py-10 text-center">
          <span className="text-3xl block mb-2">💬</span>
          <p className="text-body text-gray-400">暂无评论，快来抢沙发！</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          <AnimatePresence>
            {comments.map((topComment, idx) => (
              <motion.div
                key={topComment.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
              >
                <CommentItem
                  comment={topComment}
                  currentUserId={currentUserId}
                  onDelete={onDelete}
                  onReply={onReply}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 桌面端内联评论输入 */}
      <div className="hidden md:block mt-4 pt-4 border-t border-gray-100">
        {replyTarget && (
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
            <span>回复 <span className="text-coral-500">@{replyTarget.nickname}</span></span>
            <button
              onClick={onCancelReply}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="取消回复"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && canSubmit && guard(handleSubmitComment, '评论')}
            placeholder={replyTarget ? `回复 @${replyTarget.nickname}...` : '说点什么...'}
            disabled={submittingComment}
            className="flex-1 h-10 px-4 rounded-full bg-gray-50 border border-gray-100 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-coral-300 focus:ring-1 focus:ring-coral-100 transition-colors disabled:opacity-50"
          />
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => guard(handleSubmitComment, '评论')}
            disabled={!canSubmit}
            aria-label="发送评论"
            className={`shrink-0 h-10 px-5 rounded-full text-sm font-medium transition-colors duration-200 ${
              canSubmit
                ? 'bg-gradient-to-r from-coral-500 to-coral-400 text-white shadow-coral'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            {submittingComment ? '发送中...' : '发送'}
          </motion.button>
        </div>
      </div>
    </motion.section>
  )
}
