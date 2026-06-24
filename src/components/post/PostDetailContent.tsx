'use client'

import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/animations'
import type { Post } from '@/types'

interface Props {
  post: Post
}

export default function PostDetailContent({ post }: Props) {
  const stars = Array.from({ length: 5 }, (_, i) => i < post.rating)

  return (
    <>
      {/* Title card */}
      <motion.div
        className="bg-white rounded-2xl shadow-card p-5"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0}
      >
        <h1 className="text-h1 text-gray-800 leading-snug">{post.title}</h1>
        <div className="flex items-center gap-3 mt-3">
          {post.price && (
            <span className="text-sm font-semibold font-num text-coral-500 bg-coral-50 px-3 py-1 rounded-lg">
              {post.price}
            </span>
          )}
          {post.product_name && (
            <span className="text-caption text-gray-400 truncate flex-1">{post.product_name}</span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-3">
          {stars.map((filled, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.3 + i * 0.06, type: 'spring', stiffness: 200 }}
              className={`text-base ${filled ? 'text-amber-400' : 'text-gray-200'}`}
              aria-hidden="true"
            >
              ★
            </motion.span>
          ))}
          <span className="text-caption text-gray-400 ml-1 font-num">{post.rating}.0 分</span>
        </div>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="tag-chip text-tiny"
              >
                #{tag}
              </motion.span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Author + content card */}
      <motion.div
        className="mt-4 bg-white rounded-2xl shadow-card p-5"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={1}
      >
        <div className="flex items-center gap-2 mb-3">
          <img
            src={post.user?.avatar_url || ''}
            alt={`${post.user?.nickname || '匿名'}的头像`}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <p className="text-body font-medium text-gray-700">{post.user?.nickname || '匿名买家'}</p>
            <p className="text-tiny text-gray-400">
              {new Date(post.created_at).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <p className="text-body text-gray-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </motion.div>
    </>
  )
}
