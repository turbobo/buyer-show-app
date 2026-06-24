import { useState, useEffect, useRef, useCallback } from 'react'
import { searchPosts } from '@/services/post'
import { fetchUserFavoriteTagSet, toggleTagFavorite } from '@/services/favorite'
import { fetchSearchHistory, saveSearchKeyword, clearSearchHistory } from '@/services/search'
import { useUserStore } from '@/store/user'
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
      .then((s) => { if (!cancelled) setFavoritedTags(s) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [user])

  useEffect(() => {
    if (!isLoggedIn || !user) return
    fetchSearchHistory(user.id).then(setSearchHistory)
  }, [isLoggedIn, user])

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
    const q = query.trim()
    if (!q || !isLoggedIn || !user) return
    await saveSearchKeyword(user.id, q)
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item !== q)
      return [q, ...filtered].slice(0, 5)
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
