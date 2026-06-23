'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Post } from '@/types'
import SmartImage from '@/components/ui/SmartImage'
import { listItem } from '@/lib/animations'

interface Props {
  post: Post
  index?: number
  /**
   * 作者专属操作（在我的发布页传入）；传入后卡片封面图右上角出现三点菜单。
   * 未传时卡片保持默认纯阅读样式。
   */
  ownerActions?: {
    onEdit: () => void
    onDelete: () => void
  }
}

export default function PostCard({ post, index = 0, ownerActions }: Props) {
  const router = useRouter()
  const coverUrl = post.images[0] || ''
  const heights = [200, 220, 240, 260, 180]
  const imgHeight = heights[index % heights.length]
  const displayLikes = post.like_count > 999
    ? `${(post.like_count / 1000).toFixed(1)}k`
    : String(post.like_count)
  const isAboveFold = index < 2

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handlePrefetch = useCallback(() => {
    router.prefetch(`/post/${post.id}`)
  }, [router, post.id])

  // 点外部关闭菜单
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const openMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setMenuOpen((v) => !v)
  }

  const invoke = (e: React.MouseEvent, fn: () => void) => {
    e.preventDefault()
    e.stopPropagation()
    setMenuOpen(false)
    fn()
  }

  return (
    <motion.div
      variants={listItem}
      initial="hidden"
      animate="visible"
      custom={index}
    >
      <Link href={`/post/${post.id}`} aria-label={`查看帖子：${post.title}`} onMouseEnter={handlePrefetch}>
        <article className="card mb-3 hover:shadow-float transition-shadow duration-200 relative">
          {/* 封面图 */}
          {coverUrl && (
            <div className="relative">
              <SmartImage
                src={coverUrl}
                alt={post.title}
                style={{ height: imgHeight }}
                loading={isAboveFold ? 'eager' : 'lazy'}
              />
              {post.images.length > 1 && (
                <div className={`absolute top-2 ${ownerActions ? 'left-2' : 'right-2'} bg-black/50 text-white text-tiny px-1.5 py-0.5 rounded-full`}>
                  {post.images.length}图
                </div>
              )}
            </div>
          )}

          {/* 内容 */}
          <div className="p-3">
            <h3 className="text-h2 text-gray-800 line-clamp-2">
              {post.title}
            </h3>

            {post.price && (
              <span className="text-coral-500 font-bold text-body font-num mt-1 block">
                {post.price}
              </span>
            )}

            {/* 评分 */}
            <div className="flex items-center gap-0.5 mt-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-caption ${i < post.rating ? 'text-amber-400' : 'text-gray-200'}`}
                  aria-hidden="true"
                >
                  ★
                </span>
              ))}
            </div>

            {/* 标签 */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-tiny text-coral-500 bg-coral-50 px-1.5 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 底部：用户 + 点赞 */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <img
                  src={post.user?.avatar_url || ''}
                  alt={`${post.user?.nickname || '匿名'}的头像`}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-tiny text-gray-500 max-w-[80px] truncate">
                  {post.user?.nickname || '匿名'}
                </span>
              </div>
              <span className="text-tiny text-gray-400 flex items-center gap-0.5 font-num">
                ♥ {displayLikes}
              </span>
            </div>
          </div>

          {/* 作者操作菜单：三点按钮 + 下拉 */}
          {ownerActions && (
            <div
              ref={menuRef}
              className="absolute top-2 right-2 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={openMenu}
                aria-label="帖子操作"
                aria-expanded={menuOpen}
                className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm transition-colors ${
                  menuOpen ? 'bg-white/95 text-gray-700' : 'bg-black/35 text-white hover:bg-black/50'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="1.8" />
                  <circle cx="12" cy="12" r="1.8" />
                  <circle cx="19" cy="12" r="1.8" />
                </svg>
              </motion.button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-1.5 w-28 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
                  >
                    <button
                      onClick={(e) => invoke(e, ownerActions.onEdit)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      编辑
                    </button>
                    <div className="h-px bg-gray-100" />
                    <button
                      onClick={(e) => invoke(e, ownerActions.onDelete)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-coral-500 hover:bg-coral-50 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-2 14a2 2 0 01-2 2H9a2 2 0 01-2-2L5 6" />
                        <path d="M9 6V4a2 2 0 012-2h2a2 2 0 012 2v2" />
                      </svg>
                      删除
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </article>
      </Link>
    </motion.div>
  )
}
