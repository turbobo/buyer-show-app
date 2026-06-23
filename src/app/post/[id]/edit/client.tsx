'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ImageUploader from '@/components/ImageUploader'
import StarRating from '@/components/StarRating'
import { HOT_TAGS } from '@/lib/mock-data'
import { fetchPostDetail, updatePost } from '@/services/post'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function EditPostClient() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const { user, isLoggedIn, authReady } = useUserStore()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const [images, setImages] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [productName, setProductName] = useState('')
  const [price, setPrice] = useState('')
  const [rating, setRating] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // 等会话恢复完成后再加载帖子并校验归属
  useEffect(() => {
    if (!authReady) return
    if (!isLoggedIn || !user) {
      router.replace('/profile')
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const { post } = await fetchPostDetail(postId)
        if (cancelled) return
        // 客户端先做一次归属校验：UI 提前阻断；服务端 updatePost 会再校验一次兜底
        if (post.user_id !== user.id) {
          setUnauthorized(true)
          return
        }
        setImages(post.images || [])
        setTitle(post.title || '')
        setContent(post.content || '')
        setProductName(post.product_name || '')
        setPrice(post.price || '')
        setRating(post.rating || 0)
        setSelectedTags(post.tags || [])
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [authReady, isLoggedIn, user, postId, router])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 3 ? [...prev, tag] : prev
    )
  }

  const handleSubmit = async () => {
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (trimmedTitle.length < 2 || trimmedTitle.length > 50) {
      useUIStore.getState().addToast('error', '标题需 2-50 字')
      return
    }
    if (trimmedContent.length < 10 || trimmedContent.length > 2000) {
      useUIStore.getState().addToast('error', '正文至少 10 字（最多 2000 字）')
      return
    }

    setSubmitting(true)
    try {
      await updatePost(postId, {
        title: trimmedTitle,
        content: trimmedContent,
        images,
        tags: selectedTags,
        product_name: productName.trim(),
        price: price.trim(),
        rating: rating || 5,
      })
      setShowSuccess(true)
      setTimeout(() => router.push(`/post/${postId}`), 1200)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '更新失败'
      useUIStore.getState().addToast('error', message)
    } finally {
      setSubmitting(false)
    }
  }

  const hasHistory = typeof window !== 'undefined' && window.history.length > 1

  // 加载中骨架
  if (!authReady || loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          className="w-7 h-7 border-2 border-coral-200 border-t-coral-500 rounded-full"
        />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center px-8 text-center">
        <p className="text-base text-gray-700 mb-2">帖子不存在或已被删除</p>
        <button
          onClick={() => router.push('/')}
          className="mt-2 px-5 py-2 rounded-full bg-coral-500 text-white text-sm"
        >
          返回首页
        </button>
      </div>
    )
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-14 h-14 rounded-full bg-coral-100 flex items-center justify-center mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.8" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <p className="text-base text-gray-700 mb-1">无权修改此帖子</p>
        <p className="text-xs text-gray-400 mb-4">仅作者本人可以编辑买家秀</p>
        <button
          onClick={() => router.push(`/post/${postId}`)}
          className="px-5 py-2 rounded-full bg-coral-500 text-white text-sm"
        >
          查看帖子
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-50 pb-28 md:pt-20">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100/60 md:hidden">
        <div className="flex items-center justify-between px-5 h-14">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => (hasHistory ? router.back() : router.push(`/post/${postId}`))}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </motion.button>
          <h1 className="text-base font-semibold text-gray-800">编辑买家秀</h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="px-5 pt-5 space-y-6 md:max-w-2xl md:mx-auto">
        {/* Images */}
        <motion.section custom={0} variants={sectionVariants} initial="hidden" animate="visible">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            商品图片
            <span className="text-gray-400 font-normal ml-1.5">（最多 9 张）</span>
          </label>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <ImageUploader images={images} onChange={setImages} max={9} />
          </div>
        </motion.section>

        {/* Title */}
        <motion.section custom={1} variants={sectionVariants} initial="hidden" animate="visible">
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

        {/* Content */}
        <motion.section custom={2} variants={sectionVariants} initial="hidden" animate="visible">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            使用体验 <span className="text-coral-500">*</span>
          </label>
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 2000))}
              placeholder="分享你的真实使用感受，帮助更多人做出选择...（至少 10 字）"
              rows={5}
              className="w-full bg-white rounded-2xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-300 shadow-sm border-0 outline-none focus:ring-2 focus:ring-coral-200 transition-all resize-none leading-relaxed"
            />
            <span className={`absolute right-4 bottom-3 text-[11px] ${content.trim().length > 0 && content.trim().length < 10 ? 'text-coral-500' : 'text-gray-300'}`}>
              {content.length}/2000
            </span>
          </div>
        </motion.section>

        {/* Product Info */}
        <motion.section custom={3} variants={sectionVariants} initial="hidden" animate="visible">
          <label className="block text-sm font-medium text-gray-700 mb-3">商品信息</label>
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="商品名称（选填）"
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:ring-2 focus:ring-coral-200 focus:bg-white transition-all"
            />
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="入手价格（选填，如 ¥299）"
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:ring-2 focus:ring-coral-200 focus:bg-white transition-all"
            />
          </div>
        </motion.section>

        {/* Rating */}
        <motion.section custom={4} variants={sectionVariants} initial="hidden" animate="visible">
          <label className="block text-sm font-medium text-gray-700 mb-3">商品评分</label>
          <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center">
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>
        </motion.section>

        {/* Tags */}
        <motion.section custom={5} variants={sectionVariants} initial="hidden" animate="visible">
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
      </div>

      {/* Fixed Submit */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-5 pb-8 bg-gradient-to-t from-warm-50 via-warm-50 to-transparent z-30">
        {(() => {
          const trimmedTitle = title.trim()
          const trimmedContent = content.trim()
          const isFormValid = trimmedTitle.length >= 2 && trimmedContent.length >= 10
          const hint = !trimmedTitle
            ? '请填写标题'
            : trimmedTitle.length < 2
              ? `标题还需 ${2 - trimmedTitle.length} 字`
              : !trimmedContent
                ? '请填写使用体验'
                : trimmedContent.length < 10
                  ? `使用体验还需 ${10 - trimmedContent.length} 字`
                  : null
          return (
            <>
              <AnimatePresence>
                {hint && (
                  <motion.p
                    key={hint}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                    className="mb-2 text-center text-xs text-coral-500"
                  >
                    {hint}
                  </motion.p>
                )}
              </AnimatePresence>
              <motion.button
                whileTap={{ scale: isFormValid ? 0.96 : 1 }}
                onClick={handleSubmit}
                disabled={submitting}
                aria-disabled={!isFormValid || submitting}
                className={`w-full py-3.5 rounded-2xl text-base font-semibold transition-all duration-300 shadow-lg ${
                  !isFormValid
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
                    保存中...
                  </span>
                ) : (
                  '保存修改'
                )}
              </motion.button>
            </>
          )
        })()}
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-[300] bg-white rounded-2xl px-6 py-4 shadow-2xl flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">保存成功!</p>
              <p className="text-xs text-gray-400">即将返回详情页...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
