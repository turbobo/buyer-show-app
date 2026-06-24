'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp } from '@/lib/animations'
import CommentItem from '@/components/CommentItem'
import type { Comment } from '@/types'

interface Props {
  comments: Comment[]
}

export default function CommentSection({ comments }: Props) {
  return (
    <motion.section
      className="mt-4 bg-white rounded-2xl shadow-card p-5"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={3}
    >
      <h2 className="text-h2 text-gray-800 mb-2">
        评论 <span className="text-body font-normal text-gray-400 font-num">({comments.length})</span>
      </h2>
      {comments.length === 0 ? (
        <div className="py-10 text-center">
          <span className="text-3xl block mb-2">💬</span>
          <p className="text-body text-gray-400">暂无评论，快来抢沙发！</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          <AnimatePresence>
            {comments.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <CommentItem comment={c} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.section>
  )
}
