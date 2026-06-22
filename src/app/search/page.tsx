'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HOT_TAGS } from '@/lib/mock-data'
import { searchPosts } from '@/services/post'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/user'
import PostCard from '@/components/PostCard'
import type { Post } from '@/types'

const MAX_HISTORY = 5

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults] = useState<Post[]>([])
  const [searching, setSearching] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const isLoggedIn = useUserStore((s) => s.isLoggedIn)

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Load search history from Supabase
  useEffect(() => {
    if (!isLoggedIn) return
    supabase
      .from('search_history')
      .select('keyword')
      .order('created_at', { ascending: false })
      .limit(MAX_HISTORY)
      .then(({ data }) => {
        if (data) {
          const keywords = Array.from(new Set(data.map((d) => d.keyword)))
          setSearchHistory(keywords)
        }
      })
  }, [isLoggedIn])

  // Debounce 300ms + search
  useEffect(() => {
    const timer = setTimeout(async () => {
      const q = debouncedQuery.trim()
      if (!q) {
        setResults([])
        setTotalCount(0)
        return
      }
      setSearching(true)
      setHasSearched(true)
      try {
        const res = await searchPosts(q)
        setResults(res.list)
        setTotalCount(res.total)
      } catch {
        setResults([])
        setTotalCount(0)
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [debouncedQuery])

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleTagClick = (tag: string) => {
    setQuery(tag)
    inputRef.current?.focus()
  }

  const commitSearch = useCallback(async () => {
    const q = query.trim()
    if (!q || !isLoggedIn) return

    // Save to search_history
    await supabase.from('search_history').insert({
      user_id: useUserStore.getState().user?.id || '',
      keyword: q,
    })

    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item !== q)
      return [q, ...filtered].slice(0, MAX_HISTORY)
    })
  }, [query, isLoggedIn])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitSearch()
    }
  }

  const clearSearch = () => {
    setQuery('')
    setDebouncedQuery('')
    setHasSearched(false)
    setResults([])
    setTotalCount(0)
    inputRef.current?.focus()
  }

  const clearHistory = async () => {
    setSearchHistory([])
    if (isLoggedIn) {
      const userId = useUserStore.getState().user?.id
      if (userId) {
        await supabase.from('search_history').delete().eq('user_id', userId)
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  }

  return (
    <div className="min-h-screen bg-warm-50 pb-24 md:px-8 md:pt-20">
      {/* ── Search Bar ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100/60">
        <div className="px-5 py-3">
          <div className="relative flex items-center">
            <svg className="absolute left-4 text-gray-300 pointer-events-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索商品、品牌、标签..."
              aria-label="搜索"
              className="w-full bg-gray-50 rounded-2xl pl-11 pr-10 py-3 text-body text-gray-800 placeholder-gray-300 outline-none focus:ring-2 focus:ring-coral-200 focus:bg-white transition-all"
            />

            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={clearSearch}
                  aria-label="清除搜索内容"
                  className="absolute right-3.5 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {/* ── Default State: Hot Tags + History ── */}
        {!hasSearched && (
          <motion.div key="default" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0, y: -10 }} className="px-5 pt-6 space-y-8">
            {/* Hot Tags */}
            <motion.section variants={itemVariants}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 rounded-full bg-gradient-to-b from-coral-500 to-coral-300" />
                <h2 className="text-h2 text-gray-800">热门搜索</h2>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {HOT_TAGS.map((tag, i) => (
                  <motion.button
                    key={tag}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.04 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleTagClick(tag)}
                    className="relative px-4 py-2.5 rounded-2xl text-body font-medium bg-white text-gray-600 border border-gray-100 shadow-card hover:border-coral-200 hover:text-coral-500 transition-all duration-200"
                  >
                    <span className="text-coral-400 mr-1">#</span>{tag}
                  </motion.button>
                ))}
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
                  <motion.button whileTap={{ scale: 0.9 }} onClick={clearHistory} className="text-tiny text-gray-400 hover:text-gray-500 flex items-center gap-1 transition-colors">
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
        )}

        {/* ── Searching ── */}
        {hasSearched && searching && (
          <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center pt-20">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-body text-gray-400">搜索中...</span>
            </div>
          </motion.div>
        )}

        {/* ── Search Results ── */}
        {hasSearched && !searching && debouncedQuery.trim() && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="px-4 pt-4">
            {results.length > 0 ? (
              <>
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
              </>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center justify-center pt-20 pb-12">
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
                    <motion.button key={tag} whileTap={{ scale: 0.9 }} onClick={() => handleTagClick(tag)} className="px-3.5 py-1.5 rounded-full text-tiny font-medium bg-white text-gray-500 border border-gray-100 shadow-card hover:border-coral-200 hover:text-coral-500 transition-all">
                      #{tag}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
