'use client'

import { motion } from 'framer-motion'
import { HOT_TAGS } from '@/lib/mock-data'
import PostCard from '@/components/PostCard'
import type { Post } from '@/types'

interface Props {
  results: Post[]
  totalCount: number
  searching: boolean
  debouncedQuery: string
  handleTagClick: (tag: string) => void
}

export default function SearchResults({
  results,
  totalCount,
  searching,
  debouncedQuery,
  handleTagClick,
}: Props) {
  if (searching) {
    return (
      <motion.div
        key="searching"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center pt-20"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-body text-gray-400">搜索中...</span>
        </div>
      </motion.div>
    )
  }

  if (!debouncedQuery.trim()) return null

  if (results.length > 0) {
    return (
      <motion.div
        key="results"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="px-4 pt-4"
      >
        <div className="px-1 mb-4">
          <p className="text-body text-gray-400">
            找到 <span className="text-coral-500 font-semibold font-num">{totalCount}</span> 条相关结果
          </p>
        </div>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {results.map((post, i) => (
            <div key={post.id} className="break-inside-avoid">
              <PostCard post={post} index={i} />
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col items-center justify-center pt-20 pb-12"
    >
      <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-5">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <p className="text-h2 text-gray-400 mb-1.5">没找到相关内容</p>
      <p className="text-body text-gray-300">换个关键词试试？</p>
      <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-xs">
        {HOT_TAGS.slice(0, 5).map((tag) => (
          <motion.button
            key={tag}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleTagClick(tag)}
            className="px-3.5 py-1.5 rounded-full text-tiny font-medium bg-white text-gray-500 border border-gray-100 shadow-card hover:border-coral-200 hover:text-coral-500 transition-all"
          >
            #{tag}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
