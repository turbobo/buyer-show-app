'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MOCK_POSTS, MOCK_COMMENTS } from '@/lib/mock-data'
import CommentItem from '@/components/CommentItem'
import type { Comment } from '@/types'

/* ─── animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function PostDetailClient() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const post = MOCK_POSTS.find((p) => p.id === postId)

  const [isLiked, setIsLiked] = useState(post?.is_liked ?? false)
  const [likeCount, setLikeCount] = useState(post?.like_count ?? 0)
  const [heartBeat, setHeartBeat] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS[postId] ?? [])
  const [commentText, setCommentText] = useState('')
  const [imageLoaded, setImageLoaded] = useState(false)

  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsLiked(post?.is_liked ?? false)
    setLikeCount(post?.like_count ?? 0)
    setComments(MOCK_COMMENTS[postId] ?? [])
    setCurrentSlide(0)
    setImageLoaded(false)
  }, [postId, post])

  const handleCarouselScroll = useCallback(() => {
    const el = carouselRef.current
    if (!el || !post) return
    const idx = Math.round(el.scrollLeft / el.offsetWidth)
    setCurrentSlide(Math.min(idx, post.images.length - 1))
  }, [post])

  const toggleLike = () => {
    const next = !isLiked
    setIsLiked(next)
    setLikeCount((c) => (next ? c + 1 : c - 1))
    if (next) {
      setHeartBeat(true)
      setTimeout(() => setHeartBeat(false), 600)
    }
  }

  const submitComment = () => {
    const text = commentText.trim()
    if (!text) return
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      post_id: postId,
      user_id: 'u1',
      content: text,
      created_at: new Date().toISOString(),
      user: {
        nickname: '我',
        avatar_url: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="40" fill="#FF6B35"/><text x="40" y="42" text-anchor="middle" dominant-baseline="central" fill="white" font-size="36" font-family="sans-serif" font-weight="600">我</text></svg>')}`,
      },
    }
    setComments((prev) => [...prev, newComment])
    setCommentText('')
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-warm-50 px-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <span className="text-6xl block mb-4">📭</span>
          <h2 className="text-lg font-semibold text-gray-700">帖子不存在</h2>
          <p className="text-sm text-gray-400 mt-2">可能已被删除或链接无效</p>
          <button onClick={() => router.back()} className="btn-primary mt-6 text-sm">返回上一页</button>
        </motion.div>
      </div>
    )
  }

  const stars = Array.from({ length: 5 }, (_, i) => i < post.rating)

  // Schema.org 结构化数据
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: post.title,
    reviewBody: post.content,
    itemReviewed: {
      '@type': 'Product',
      name: post.product_name || post.title,
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: String(post.rating),
      bestRating: '5',
    },
    author: {
      '@type': 'Person',
      name: post.user?.nickname || '匿名',
    },
    datePublished: post.created_at,
  }

  return (
    <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    <div className="min-h-screen bg-warm-50 pb-24 relative">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => router.back()}
        className="fixed top-4 md:top-20 z-30 w-9 h-9 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center"
        aria-label="返回"
        style={{ left: 'max(1rem, calc(50% - 215px + 1rem))' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </motion.button>

      {/* Desktop: two-column layout */}
      <div className="md:flex md:gap-6 md:px-8 md:pt-16">
        {/* Image Carousel */}
        <div className="relative md:w-1/2 md:sticky md:top-16 md:self-start md:rounded-2xl md:overflow-hidden md:shadow-lg">
          <div ref={carouselRef} onScroll={handleCarouselScroll} className="flex overflow-x-auto snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
            {post.images.map((src, i) => (
              <div key={i} className="w-full shrink-0 snap-center relative bg-gray-100" style={{ aspectRatio: '4/3' }}>
                <img src={src} alt={`${post.title} - ${i + 1}`} className="w-full h-full object-cover" onLoad={() => i === 0 && setImageLoaded(true)} />
              </div>
            ))}
          </div>

        {post.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {post.images.map((_, i) => (
              <motion.div
                key={i}
                animate={{ width: i === currentSlide ? 18 : 6, backgroundColor: i === currentSlide ? '#FF6B35' : 'rgba(255,255,255,0.6)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="h-1.5 rounded-full"
              />
            ))}
          </div>
        )}

        {post.images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded-full">
            {currentSlide + 1} / {post.images.length}
          </div>
        )}
      </div>

      {/* Content (right column on desktop) */}
      <div className="px-5 -mt-4 relative z-10 md:w-1/2 md:mt-0 md:pt-0 md:px-0">
        <motion.div className="bg-white rounded-2xl shadow-sm p-5" variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <h1 className="text-lg font-bold text-gray-800 leading-snug">{post.title}</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-sm font-semibold text-coral-500 bg-coral-50 px-3 py-1 rounded-lg">{post.price}</span>
            <span className="text-xs text-gray-400 truncate flex-1">{post.product_name}</span>
          </div>
          <div className="flex items-center gap-1 mt-3">
            {stars.map((filled, i) => (
              <motion.span key={i} initial={{ opacity: 0, scale: 0.5, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 0.3 + i * 0.06, type: 'spring', stiffness: 200 }} className={`text-base ${filled ? 'text-amber-400' : 'text-gray-200'}`}>★</motion.span>
            ))}
            <span className="text-xs text-gray-400 ml-1">{post.rating}.0 分</span>
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tags.map((tag, i) => (
                <motion.span key={tag} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.05 }} className="tag-chip text-xs">#{tag}</motion.span>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div className="mt-4 bg-white rounded-2xl shadow-sm p-5" variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          <div className="flex items-center gap-2 mb-3">
            <img src={post.user?.avatar_url || ''} alt="" className="w-8 h-8 rounded-full object-cover" />
            <div>
              <p className="text-sm font-medium text-gray-700">{post.user?.nickname || '匿名买家'}</p>
              <p className="text-[10px] text-gray-400">{new Date(post.created_at).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </motion.div>

        {/* Like Button */}
        <motion.div className="mt-4 flex justify-center" variants={fadeUp} initial="hidden" animate="visible" custom={2}>
          <motion.button onClick={toggleLike} whileTap={{ scale: 0.9 }} aria-label={isLiked ? '取消点赞' : '点赞'} className={`flex items-center gap-2 px-8 py-3 rounded-full transition-colors duration-200 ${isLiked ? 'bg-coral-50 border-2 border-coral-200' : 'bg-white border-2 border-gray-100'} shadow-sm`}>
            <motion.span animate={heartBeat ? { scale: [1, 1.4, 0.9, 1.2, 1], rotate: [0, -10, 10, -5, 0] } : { scale: 1 }} transition={{ duration: 0.5, ease: 'easeInOut' }} className="text-xl">
              {isLiked ? '❤️' : '🤍'}
            </motion.span>
            <motion.span key={likeCount} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={`text-sm font-semibold ${isLiked ? 'text-coral-500' : 'text-gray-400'}`}>
              {likeCount > 999 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}
            </motion.span>
          </motion.button>
        </motion.div>

        {/* Comments */}
        <motion.section className="mt-4 bg-white rounded-2xl shadow-sm p-5" variants={fadeUp} initial="hidden" animate="visible" custom={3}>
          <h2 className="text-base font-bold text-gray-800 mb-2">评论 <span className="text-sm font-normal text-gray-400">({comments.length})</span></h2>
          {comments.length === 0 ? (
            <div className="py-10 text-center">
              <span className="text-3xl block mb-2">💬</span>
              <p className="text-sm text-gray-400">暂无评论，快来抢沙发！</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              <AnimatePresence>
                {comments.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3 }}>
                    <CommentItem comment={c} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.section>
      </div>
      </div> {/* close md:flex container */}

      {/* Bottom Comment Bar (mobile only) */}
      <div className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-lg border-t border-gray-100 z-40 safe-bottom">
        <div className="flex items-center gap-2 px-4 py-2.5">
          <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitComment()} placeholder="说点什么..." className="flex-1 h-9 px-4 rounded-full bg-gray-50 border border-gray-100 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-coral-300 focus:ring-1 focus:ring-coral-100 transition-colors" />
          <motion.button whileTap={{ scale: 0.88 }} onClick={submitComment} disabled={!commentText.trim()} aria-label="发送评论" className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 ${commentText.trim() ? 'bg-gradient-to-r from-coral-500 to-coral-400 shadow-md shadow-coral-200' : 'bg-gray-100'}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={commentText.trim() ? 'white' : '#9CA3AF'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
    </>
  )
}
