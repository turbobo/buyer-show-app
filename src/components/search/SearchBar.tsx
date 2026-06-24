'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  query: string
  setQuery: (value: string) => void
  inputRef: React.RefObject<HTMLInputElement>
  handleKeyDown: (e: React.KeyboardEvent) => void
  clearSearch: () => void
}

export default function SearchBar({ query, setQuery, inputRef, handleKeyDown, clearSearch }: Props) {
  return (
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
  )
}
