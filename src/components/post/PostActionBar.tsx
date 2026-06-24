'use client'

import { motion } from 'framer-motion'
import { fadeUp, heartbeatKeyframes, heartbeatTransition } from '@/lib/animations'

interface Props {
  isLiked: boolean
  likeCount: number
  isFavorited: boolean
  favoriteCount: number
  heartBeat: boolean
  handleToggleLike: () => void
  handleToggleFavorite: () => void
  guard: (action: () => void, reason?: string) => void
}

export default function PostActionBar({
  isLiked,
  likeCount,
  isFavorited,
  favoriteCount,
  heartBeat,
  handleToggleLike,
  handleToggleFavorite,
  guard,
}: Props) {
  const formatCount = (count: number) =>
    count > 999 ? `${(count / 1000).toFixed(1)}k` : count

  return (
    <motion.div
      className="mt-4 flex items-center justify-center gap-3"
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={2}
    >
      <motion.button
        onClick={() => guard(handleToggleLike, '点赞')}
        whileTap={{ scale: 0.92 }}
        aria-label={isLiked ? '取消点赞' : '点赞'}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors duration-200 ${
          isLiked ? 'bg-coral-50 border-2 border-coral-200' : 'bg-white border-2 border-gray-100'
        } shadow-card`}
      >
        <motion.span
          animate={heartBeat ? heartbeatKeyframes : { scale: 1 }}
          transition={heartbeatTransition}
          className="text-xl"
        >
          {isLiked ? '❤️' : '🤍'}
        </motion.span>
        <span
          className={`text-sm font-medium ${isLiked ? 'text-coral-500' : 'text-gray-500'}`}
        >
          {isLiked ? '已点赞' : '点赞'}
        </span>
        <motion.span
          key={likeCount}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`text-sm font-semibold font-num ${isLiked ? 'text-coral-500' : 'text-gray-400'}`}
        >
          {formatCount(likeCount)}
        </motion.span>
      </motion.button>

      <motion.button
        onClick={() => guard(handleToggleFavorite, '收藏')}
        whileTap={{ scale: 0.92 }}
        aria-label={isFavorited ? '取消收藏' : '收藏'}
        className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors duration-200 ${
          isFavorited ? 'bg-amber-50 border-2 border-amber-200' : 'bg-white border-2 border-gray-100'
        } shadow-card`}
      >
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={isFavorited ? '#F59E0B' : 'none'}
          stroke={isFavorited ? '#F59E0B' : '#9CA3AF'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={isFavorited ? { scale: [1, 1.25, 1] } : { scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
        </motion.svg>
        <span
          className={`text-sm font-medium ${isFavorited ? 'text-amber-500' : 'text-gray-500'}`}
        >
          {isFavorited ? '已收藏' : '收藏'}
        </span>
        <motion.span
          key={favoriteCount}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`text-sm font-semibold font-num ${isFavorited ? 'text-amber-500' : 'text-gray-400'}`}
        >
          {formatCount(favoriteCount)}
        </motion.span>
      </motion.button>
    </motion.div>
  )
}
