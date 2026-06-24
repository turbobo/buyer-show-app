'use client'

import { motion } from 'framer-motion'
import { usePostEditForm } from '@/hooks/usePostEditForm'
import PostEditForm from '@/components/post/PostEditForm'

export default function EditPostClient() {
  const form = usePostEditForm()

  if (!form.authReady || form.loading) {
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

  if (form.notFound) {
    return (
      <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center px-8 text-center">
        <p className="text-base text-gray-700 mb-2">帖子不存在或已被删除</p>
        <button
          onClick={() => form.router.push('/')}
          className="mt-2 px-5 py-2 rounded-full bg-coral-500 text-white text-sm"
        >
          返回首页
        </button>
      </div>
    )
  }

  if (form.unauthorized) {
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
          onClick={() => form.router.push(`/post/${form.postId}`)}
          className="px-5 py-2 rounded-full bg-coral-500 text-white text-sm"
        >
          查看帖子
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-50 pb-28 md:pt-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100/60 md:hidden">
        <div className="flex items-center justify-between px-5 h-14">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => (form.hasHistory ? form.router.back() : form.router.push(`/post/${form.postId}`))}
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

      <PostEditForm
        formState={{
          images: form.images,
          title: form.title,
          content: form.content,
          productName: form.productName,
          price: form.price,
          rating: form.rating,
          selectedTags: form.selectedTags,
        }}
        formActions={{
          setImages: form.setImages,
          setTitle: form.setTitle,
          setContent: form.setContent,
          setProductName: form.setProductName,
          setPrice: form.setPrice,
          setRating: form.setRating,
          toggleTag: form.toggleTag,
        }}
        submitting={form.submitting}
        showSuccess={form.showSuccess}
        handleSubmit={form.handleSubmit}
      />
    </div>
  )
}
