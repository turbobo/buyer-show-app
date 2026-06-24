'use client'

import { motion } from 'framer-motion'
import PostCard from '@/components/PostCard'
import type { Post } from '@/types'

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

interface Props {
  userPosts: Post[]
}

export default function ProfilePosts({ userPosts }: Props) {
  return (
    <motion.div
      custom={2}
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 rounded-full bg-gradient-to-b from-coral-500 to-coral-300" />
        <h3 className="text-base font-semibold text-gray-800">我的买家秀</h3>
        <span className="text-xs text-gray-400 ml-1">({userPosts.length})</span>
      </div>

      {userPosts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {userPosts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <p className="text-sm text-gray-400 mb-1">还没有发布买家秀</p>
          <p className="text-xs text-gray-300">分享你的购物体验吧</p>
        </div>
      )}
    </motion.div>
  )
}
