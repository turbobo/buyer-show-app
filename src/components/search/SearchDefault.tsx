'use client'

import { motion } from 'framer-motion'
import { HOT_TAGS } from '@/lib/mock-data'

interface Props {
  searchHistory: string[]
  favoritedTags: Set<string>
  handleTagClick: (tag: string) => void
  handleToggleTagFavorite: (tag: string, e: React.MouseEvent) => void
  handleClearHistory: () => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export default function SearchDefault({
  searchHistory,
  favoritedTags,
  handleTagClick,
  handleToggleTagFavorite,
  handleClearHistory,
}: Props) {
  return (
    <motion.div
      key="default"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -10 }}
      className="px-5 pt-6 space-y-8"
    >
      {/* Hot Tags */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-coral-500 to-coral-300" />
          <h2 className="text-h2 text-gray-800">热门搜索</h2>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {HOT_TAGS.map((tag, i) => {
            const isFav = favoritedTags.has(tag)
            return (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                className="inline-flex items-center gap-1"
              >
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleTagClick(tag)}
                  className="px-4 py-2.5 rounded-2xl text-body font-medium bg-white text-gray-600 border border-gray-100 shadow-card hover:border-coral-200 hover:text-coral-500 transition-all duration-200"
                >
                  <span className="text-coral-400 mr-1">#</span>{tag}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.75 }}
                  onClick={(e) => handleToggleTagFavorite(tag, e)}
                  aria-label={isFav ? `取消收藏标签 ${tag}` : `收藏标签 ${tag}`}
                  className={`w-7 h-7 rounded-full flex items-center justify-center border shadow-card transition-colors ${
                    isFav
                      ? 'bg-coral-50 border-coral-200 text-coral-500'
                      : 'bg-white border-gray-100 text-gray-300 hover:text-coral-400'
                  }`}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill={isFav ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </motion.button>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-gray-300 to-gray-200" />
              <h2 className="text-h2 text-gray-800">搜索历史</h2>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleClearHistory}
              className="text-tiny text-gray-400 hover:text-gray-500 flex items-center gap-1 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              清空
            </motion.button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((term, i) => (
              <motion.button
                key={term + i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => handleTagClick(term)}
                className="px-3.5 py-2 rounded-xl text-body text-gray-500 bg-gray-50 border border-gray-100 hover:border-gray-200 hover:text-gray-700 transition-all"
              >
                <svg className="inline-block mr-1.5 -mt-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {term}
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}

      {/* Trending hint */}
      <motion.section variants={itemVariants} className="bg-gradient-to-br from-coral-50/80 to-orange-50/50 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center shadow-card">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div>
            <p className="text-body font-semibold text-gray-700">发现好物</p>
            <p className="text-tiny text-gray-400 mt-0.5">试试搜索商品名称、品牌或标签</p>
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}
