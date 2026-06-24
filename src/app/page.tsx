'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HOT_TAGS } from '@/lib/mock-data'
import { fetchPosts } from '@/services/post'
import { useUserStore } from '@/store/user'
import { seedIfEmpty } from '@/lib/seed'
import PostCard from '@/components/PostCard'
import Skeleton from '@/components/Skeleton'
import type { Post } from '@/types'

const ALL_TAGS = ['全部', ...HOT_TAGS]

export default function HomePage() {
  const authReady = useUserStore((s) => s.authReady)
  const [activeTag, setActiveTag] = useState('全部')
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 加载帖子数据
  const loadPosts = useCallback(async (p: number, tag: string, append = false) => {
    try {
      const res = await fetchPosts(p, tag === '全部' ? undefined : tag)
      if (append) {
        setPosts((prev) => [...prev, ...res.list])
      } else {
        setPosts(res.list)
      }
      setHasMore(res.hasMore)
      setPage(p)
    } catch (err) {
      console.error('[home] loadPosts error:', err)
    }
  }, [])

  // 初始化：等认证就绪 → 种子数据 → 加载帖子
  useEffect(() => {
    if (!authReady) return

    async function init() {
      setLoading(true)
      await seedIfEmpty()
      await loadPosts(1, activeTag)
      setLoading(false)
    }
    init()
  }, [authReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // 标签切换
  const handleTagChange = useCallback(async (tag: string) => {
    setActiveTag(tag)
    setLoading(true)
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    await loadPosts(1, tag)
    setLoading(false)
  }, [loadPosts])

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadPosts(1, activeTag)
    setRefreshing(false)
  }, [activeTag, loadPosts])

  // 触底加载更多
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || loadingMore || !hasMore) return
    const { scrollTop, scrollHeight, clientHeight } = el
    if (scrollTop + clientHeight >= scrollHeight - 80) {
      setLoadingMore(true)
      loadPosts(page + 1, activeTag, true).finally(() => setLoadingMore(false))
    }
  }, [loadingMore, hasMore, page, activeTag, loadPosts])

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
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="买家说" width={36} height={36} loading="lazy" />
            <div>
              <h1
                className="text-2xl font-extrabold tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A5C 50%, #FFAB87 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                买家说
              </h1>
              <p className="text-[10px] text-gray-400 tracking-wide">
                真实购物体验 · 好物发现社区
              </p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9, rotate: -180 }}
            onClick={handleRefresh}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm"
            aria-label="刷新内容"
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
          role="tablist"
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
                role="tab"
                aria-selected={isActive}
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
              {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                  <span className="text-5xl mb-4">📦</span>
                  <p className="text-sm">
                    {activeTag === '全部' ? '还没有内容，来发第一条买家秀吧' : `暂无「${activeTag}」相关内容`}
                  </p>
                </div>
              ) : (
                <>
                  <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-3">
                    {posts.map((post, i) => (
                      <div key={post.id} className="break-inside-avoid">
                        <PostCard post={post} index={i} />
                      </div>
                    ))}
                  </div>

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
                            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15, ease: 'easeInOut' }}
                            className="w-1.5 h-1.5 rounded-full bg-coral-400"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 ml-1">加载中...</span>
                    </motion.div>
                  )}

                  {!hasMore && posts.length > 0 && (
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
            aria-label="回到顶部"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
