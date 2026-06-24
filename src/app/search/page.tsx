'use client'

import { AnimatePresence } from 'framer-motion'
import { useSearchPage } from '@/hooks/useSearchPage'
import SearchBar from '@/components/search/SearchBar'
import SearchDefault from '@/components/search/SearchDefault'
import SearchResults from '@/components/search/SearchResults'

export default function SearchPage() {
  const {
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
  } = useSearchPage()

  return (
    <div className="min-h-screen bg-warm-50 pb-24 md:px-8 md:pt-20">
      <SearchBar
        query={query}
        setQuery={setQuery}
        inputRef={inputRef}
        handleKeyDown={handleKeyDown}
        clearSearch={clearSearch}
      />

      <AnimatePresence mode="wait">
        {!hasSearched ? (
          <SearchDefault
            key="default"
            searchHistory={searchHistory}
            favoritedTags={favoritedTags}
            handleTagClick={handleTagClick}
            handleToggleTagFavorite={handleToggleTagFavorite}
            handleClearHistory={handleClearHistory}
          />
        ) : (
          <SearchResults
            key="results"
            results={results}
            totalCount={totalCount}
            searching={searching}
            debouncedQuery={debouncedQuery}
            handleTagClick={handleTagClick}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
