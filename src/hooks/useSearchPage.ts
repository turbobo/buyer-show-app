import { useState, useEffect, useRef, useCallback } from 'react'
import { searchPosts } from '@/services/post'
import { fetchUserFavoriteTagSet, toggleTagFavorite } from '@/services/favorite'
import { fetchSearchHistory, saveSearchKeyword, clearSearchHistory } from '@/services/search'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import type { Post } from '@/types'

export function useSearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults] = useState<Post[]>([])
  const [searching, setSearching] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [favoritedTags, setFavoritedTags] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  const isLoggedIn = useUserStore((s) => s.isLoggedIn)
  const user = useUserStore((s) => s.user)
  const addToast = useUIStore((s) => s.addToast)
  const { guard } = useAuthGuard()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!user) {
      setFavoritedTags(new Set())
      return
    }
    let cancelled = false
    fetchUserFavoriteTagSet(user.id)
      .then((s) => {
        if (!cancelled) setFavoritedTags(s)
      })
      .catch((err: unknown) => {
        addToast('error', err instanceof Error ? err.message : '加载收藏标签失败')
      })
    return () => {
      cancelled = true
    }
  }, [user, addToast])

  useEffect(() => {
    if (!isLoggedIn || !user) return
    fetchSearchHistory(user.id)
      .then(setSearchHistory)
      .catch((err: unknown) => {
        addToast('error', err instanceof Error ? err.message : '加载搜索历史失败')
      })
  }, [isLoggedIn, user, addToast])

  useEffect(() => {
    const timer = setTimeout(async () => {
      const queryText = debouncedQuery.trim()
      if (!queryText) {
        setResults([])
        setTotalCount(0)
        return
      }
      setSearching(true)
      setHasSearched(true)
      try {
        const res = await searchPosts(queryText)
        setResults(res.list)
        setTotalCount(res.total)
      } catch (err: unknown) {
        addToast('error', err instanceof Error ? err.message : '搜索失败')
        setResults([])
        setTotalCount(0)
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [debouncedQuery, addToast])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleTagClick = (tag: string) => {
    setQuery(tag)
    inputRef.current?.focus()
  }

  const handleToggleTagFavorite = async (tag: string, e: React.MouseEvent) => {
    e.stopPropagation()
    guard(async () => {
      const res = await toggleTagFavorite(tag)
      setFavoritedTags((prev) => {
        const next = new Set(prev)
        if (res.favorited) next.add(tag)
        else next.delete(tag)
        return next
      })
    }, '收藏标签')
  }

  const commitSearch = useCallback(async () => {
    const queryText = query.trim()
    if (!queryText || !isLoggedIn || !user) return
    await saveSearchKeyword(user.id, queryText)
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item !== queryText)
      return [queryText, ...filtered].slice(0, 5)
    })
  }, [query, isLoggedIn, user])

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

  const handleClearHistory = async () => {
    setSearchHistory([])
    if (isLoggedIn && user) {
      await clearSearchHistory(user.id)
    }
  }

  return {
    query,
    setQuery,
    debouncedQuery,
    searchHistory,
    hasSearched,
    results,
    searching,
    totalCount,
    favoritedTags,
    inputRef,
    handleTagClick,
    handleToggleTagFavorite,
    handleKeyDown,
    clearSearch,
    handleClearHistory,
  }
}
