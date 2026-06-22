'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MOCK_POSTS, HOT_TAGS } from '@/lib/mock-data'
import PostCard from '@/components/PostCard'
import Skeleton from '@/components/Skeleton'
import type { Post } from '@/types'

const ALL_TAGS = ['全部', ...HOT_TAGS]
const INITIAL_COUNT = 4
const LOAD_MORE_COUNT = 2

function splitIntoColumns(posts: Post[], colCount: number): Post[][] {
  const cols: Post[][] = Array.from({ length: colCount }, () => [])
  posts.forEach((post, i) => {
    cols[i % colCount].push(post)
  })
  return cols
}

export default function HomePage() {
  const [activeTag, setActiveTag] = useState('全部')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT)
  const [loadingMore, setLoadingMore] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const tagBarRef = useRef<HTMLDivElement>(null)

  // Filtered posts
  const filtered = activeTag === '全部'
    ? MOCK_POSTS
    : MOCK_POSTS.filter((p) => p.tags.includes(activeTag))

  const visiblePosts = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  // Initial loading simulation
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Tag change resets visible count with loading
  const handleTagChange = useCallback((tag: string) => {
    setActiveTag(tag)
    setVisibleCount(INITIAL_COUNT)
    setLoading(true)
    setTimeout(() => setLoading(false), 500)
    // Scroll feed to top
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Pull-to-refresh simulation
  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    setLoading(true)
    setVisibleCount(INITIAL_COUNT)
    setTimeout(() => {
      setLoading(false)
      setRefreshing(false)
    }, 800)
  }, [])

  // Reach-bottom detection
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || loadingMore || !hasMore) return
    const { scrollTop, scrollHeight, clientHeight } = el
    if (scrollTop + clientHeight >= scrollHeight - 80) {
      setLoadingMore(true)
      setTimeout(() => {
        setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, filtered.length))
        setLoadingMore(false)
      }, 600)
    }
  }, [loadingMore, hasMore, filtered.length])

  // Scroll-to-top button visibility
  const [showScrollTop, setShowScrollTop] = useState(false)
  const onScrollUI = useCallback(() => {
    handleScroll()
    const el = scrollRef.current
    if (el) setShowScrollTop(el.scrollTop > 400)
  }, [handleScroll])

  return (
    <div className="relative h-screen flex flex-col bg-warm-50">
      {/* ── Header (mobile only) ── */}
      <header className="shrink-0 pt-12 pb-3 px-5 md:hidden">
        <div className="flex items-end justify-between">
          <div>
            <h1
              className="text-3xl font-extrabold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A5C 50%, #FFAB87 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              买家说
            </h1>
            <p className="text-xs text-gray-400 mt-0.5 tracking-wide">
              真实购物体验 · 好物发现社区
            </p>
          </div>
          {/* Refresh button */}
          <motion.button
            whileTap={{ scale: 0.9, rotate: -180 }}
            onClick={handleRefresh}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm"
            aria-label="刷新"
          >
            <motion.svg
              animate={refreshing ? { rotate: 360 } : {}}
              transition={refreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : {}}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF6B35"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </motion.svg>
          </motion.button>
        </div>
      </header>

      {/* ── Tag Filter Bar ── */}
      <div className="shrink-0 px-5 md:px-8 pb-3 md:pt-4">
        <div
          ref={tagBarRef}
          className="flex gap-2 overflow-x-auto py-1 -mx-5 px-5"
          style={{ scrollbarWidth: 'none' }}
        >
          {ALL_TAGS.map((tag) => {
            const isActive = activeTag === tag
            return (
              <motion.button
                key={tag}
                onClick={() => handleTagChange(tag)}
                whileTap={{ scale: 0.93 }}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-coral-500 to-coral-400 text-white shadow-md shadow-coral-200'
                    : 'bg-white text-gray-500 border border-gray-100'
                }`}
              >
                {tag}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ── Feed Area ── */}
      <div
        ref={scrollRef}
        onScroll={onScrollUI}
        className="flex-1 overflow-y-auto px-4 pb-4"
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Skeleton />
            </motion.div>
          ) : (
            <motion.div
              key={`feed-${activeTag}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                  <span className="text-5xl mb-4">🔍</span>
                  <p className="text-sm">暂无「{activeTag}」相关内容</p>
                  <p className="text-xs mt-1">换个标签看看吧</p>
                </div>
              ) : (
                <>
                  {/* Masonry grid: responsive columns */}
                  <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-3">
                    {visiblePosts.map((post, i) => (
                      <div key={post.id} className="break-inside-avoid">
                        <PostCard post={post} index={i} />
                      </div>
                    ))}
                  </div>

                  {/* Bottom loading indicator */}
                  {loadingMore && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center py-6 gap-2"
                    >
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            animate={{ y: [0, -6, 0] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.6,
                              delay: i * 0.15,
                              ease: 'easeInOut',
                            }}
                            className="w-1.5 h-1.5 rounded-full bg-coral-400"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 ml-1">加载中...</span>
                    </motion.div>
                  )}

                  {!hasMore && visiblePosts.length > 0 && (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-3">
                        <div className="h-px w-8 bg-gradient-to-r from-transparent to-coral-200" />
                        <span className="text-xs text-gray-300">已经到底啦</span>
                        <div className="h-px w-8 bg-gradient-to-l from-transparent to-coral-200" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Scroll-to-top FAB ── */}
      <AnimatePresence>
        {showScrollTop && !loading && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
            className="absolute bottom-24 right-4 w-10 h-10 rounded-full bg-white shadow-lg shadow-black/10 flex items-center justify-center z-10"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FF6B35"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
