'use client'

import { motion } from 'framer-motion'

interface Props {
  commentText: string
  setCommentText: (text: string) => void
  submittingComment: boolean
  handleSubmitComment: () => void
  guard: (action: () => void, reason?: string) => void
}

export default function CommentInput({
  commentText,
  setCommentText,
  submittingComment,
  handleSubmitComment,
  guard,
}: Props) {
  const canSubmit = commentText.trim().length > 0 && !submittingComment

  return (
    <div className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-lg border-t border-gray-100 z-40 safe-bottom">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && guard(handleSubmitComment, '评论')}
          placeholder="说点什么..."
          disabled={submittingComment}
          className="flex-1 h-9 px-4 rounded-full bg-gray-50 border border-gray-100 text-body text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-coral-300 focus:ring-1 focus:ring-coral-100 transition-colors disabled:opacity-50"
        />
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => guard(handleSubmitComment, '评论')}
          disabled={!canSubmit}
          aria-label="发送评论"
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 ${
            canSubmit
              ? 'bg-gradient-to-r from-coral-500 to-coral-400 shadow-coral'
              : 'bg-gray-100'
          }`}
        >
          {submittingComment ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={canSubmit ? 'white' : '#9CA3AF'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </motion.button>
      </div>
    </div>
  )
}
