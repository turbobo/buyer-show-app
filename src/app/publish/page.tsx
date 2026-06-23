'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import ImageUploader from '@/components/ImageUploader'
import StarRating from '@/components/StarRating'
import { HOT_TAGS } from '@/lib/mock-data'
import { openLoginSheet } from '@/lib/auth-helpers'
import { createPost } from '@/services/post'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function PublishPage() {
  const router = useRouter()
  const { user, isLoggedIn } = useUserStore()

  const [images, setImages] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [productName, setProductName] = useState('')
  const [price, setPrice] = useState('')
  const [rating, setRating] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Check login on mount
  useEffect(() => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true)
    }
  }, [isLoggedIn])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 3 ? [...prev, tag] : prev
    )
  }

  const handleLogin = () => {
    openLoginSheet('发布内容')
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      useUIStore.getState().addToast('error', '请输入标题')
      return
    }
    if (!content.trim()) {
      useUIStore.getState().addToast('error', '请输入内容')
      return
    }
    if (!isLoggedIn) {
      setShowLoginPrompt(true)
      return
    }

    setSubmitting(true)
    try {
      await createPost({
        title: title.trim(),
        content: content.trim(),
        images,
        tags: selectedTags,
        product_name: productName.trim() || undefined,
        price: price.trim() || undefined,
        rating: rating || 5,
      })
      setShowSuccess(true)
      setTimeout(() => router.push('/'), 1600)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '发布失败'
      useUIStore.getState().addToast('error', message)
    } finally {
      setSubmitting(false)
    }
  }

  const hasHistory = typeof window !== 'undefined' && window.history.length > 1

  return (
    <div className="min-h-screen bg-warm-50 pb-28 md:pt-20">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100/60 md:hidden">
        <div className="flex items-center justify-between px-5 h-14">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => (hasHistory ? router.back() : router.push('/'))}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </motion.button>
          <h1 className="text-base font-semibold text-gray-800">发布买家秀</h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="px-5 pt-5 space-y-6 md:max-w-2xl md:mx-auto">
        {/* ── Section: Images ── */}
        <motion.section
          custom={0}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <label className="block text-sm font-medium text-gray-700 mb-3">
            商品图片
            <span className="text-gray-400 font-normal ml-1.5">（最多 9 张）</span>
          </label>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <ImageUploader images={images} onChange={setImages} max={9} />
          </div>
        </motion.section>

        {/* ── Section: Title ── */}
        <motion.section
          custom={1}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标题 <span className="text-coral-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 50))}
              placeholder="给买家秀起个吸引人的标题吧"
              className="w-full bg-white rounded-2xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 shadow-sm border-0 outline-none focus:ring-2 focus:ring-coral-200 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-gray-300">
              {title.length}/50
            </span>
          </div>
        </motion.section>

        {/* ── Section: Content ── */}
        <motion.section
          custom={2}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            使用体验 <span className="text-coral-500">*</span>
          </label>
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 2000))}
              placeholder="分享你的真实使用感受，帮助更多人做出选择..."
              rows={5}
              className="w-full bg-white rounded-2xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 shadow-sm border-0 outline-none focus:ring-2 focus:ring-coral-200 transition-all resize-none leading-relaxed"
            />
            <span className="absolute right-4 bottom-3 text-[11px] text-gray-300">
              {content.length}/2000
            </span>
          </div>
        </motion.section>

        {/* ── Section: Product Info ── */}
        <motion.section
          custom={3}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <label className="block text-sm font-medium text-gray-700 mb-3">商品信息</label>
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <div className="relative">
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="商品名称（选填）"
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:ring-2 focus:ring-coral-200 focus:bg-white transition-all"
              />
              <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
            </div>
            <div className="relative">
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="入手价格（选填，如 ¥299）"
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:ring-2 focus:ring-coral-200 focus:bg-white transition-all"
              />
              <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </div>
          </div>
        </motion.section>

        {/* ── Section: Rating ── */}
        <motion.section
          custom={4}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <label className="block text-sm font-medium text-gray-700 mb-3">商品评分</label>
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center">
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>
        </motion.section>

        {/* ── Section: Tags ── */}
        <motion.section
          custom={5}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标签
            <span className="text-gray-400 font-normal ml-1.5">（最多选 3 个）</span>
          </label>
          <div className="flex flex-wrap gap-2.5">
            {HOT_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag)
              const isDisabled = !isSelected && selectedTags.length >= 3
              return (
                <motion.button
                  key={tag}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => !isDisabled && toggleTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-coral-500 to-coral-400 text-white shadow-md shadow-coral-200/50'
                      : isDisabled
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-white text-gray-600 border border-gray-150 shadow-sm hover:border-coral-200'
                  }`}
                >
                  #{tag}
                </motion.button>
              )
            })}
          </div>
        </motion.section>

        {/* ── Preview hint ── */}
        {title && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-coral-50/50 rounded-2xl p-4 border border-coral-100/50"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral-400 to-coral-500 flex items-center justify-center shrink-0 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  发布后，你的买家秀将展示在「发现」页面，让更多人看到你的真实体验。
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </div>

      {/* ── Fixed Submit Button ── */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-5 pb-8 bg-gradient-to-t from-warm-50 via-warm-50 to-transparent z-30">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleSubmit}
          disabled={submitting || !title.trim()}
          className={`w-full py-3.5 rounded-2xl text-base font-semibold transition-all duration-300 shadow-lg ${
            !title.trim()
              ? 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed'
              : submitting
                ? 'bg-coral-300 text-white shadow-coral-200/30 cursor-wait'
                : 'bg-gradient-to-r from-coral-500 to-coral-400 text-white shadow-coral-300/40 hover:shadow-coral-300/60'
          }`}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              发布中...
            </span>
          ) : (
            '发布买家秀'
          )}
        </motion.button>
      </div>

      {/* ── Login Prompt Modal ── */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center px-8"
            onClick={() => setShowLoginPrompt(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coral-100 to-coral-200 flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-800 mb-1.5">登录后即可发布</h2>
                <p className="text-sm text-gray-400 mb-6">登录买家说，分享你的购物体验</p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    取消
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={handleLogin}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-coral-500 to-coral-400 shadow-md shadow-coral-200/50"
                  >
                    立即登录
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Success Toast ── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[300] bg-white rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 500, damping: 15 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
            <div>
              <p className="text-sm font-semibold text-gray-800">发布成功!</p>
              <p className="text-xs text-gray-400">即将返回首页...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
