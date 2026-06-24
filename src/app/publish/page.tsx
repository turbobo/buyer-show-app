'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { usePublishForm } from '@/hooks/usePublishForm'
import PublishFormSections from '@/components/publish/PublishFormSections'
import PublishSubmitBar from '@/components/publish/PublishSubmitBar'
import LoginPromptModal from '@/components/publish/LoginPromptModal'
import PublishSuccessToast from '@/components/publish/PublishSuccessToast'
import { smartBack } from '@/lib/nav-helpers'

export default function PublishPage() {
  const router = useRouter()
  const form = usePublishForm()

  const formState = {
    images: form.images,
    title: form.title,
    content: form.content,
    productName: form.productName,
    price: form.price,
    rating: form.rating,
    selectedTags: form.selectedTags,
  }

  const formActions = {
    setImages: form.setImages,
    setTitle: form.setTitle,
    setContent: form.setContent,
    setProductName: form.setProductName,
    setPrice: form.setPrice,
    setRating: form.setRating,
    toggleTag: form.toggleTag,
  }

  return (
    <div className="min-h-screen bg-warm-50 pb-28 md:pt-20">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100/60 md:hidden">
        <div className="flex items-center justify-between px-5 h-14">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => smartBack(router, '/')}
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

      <div className="px-5 pt-5">
        <PublishFormSections formState={formState} formActions={formActions} />
      </div>

      <PublishSubmitBar
        title={form.title}
        content={form.content}
        submitting={form.submitting}
        onSubmit={form.handleSubmit}
      />

      <LoginPromptModal
        isOpen={form.showLoginPrompt}
        onClose={form.handleCloseLoginPrompt}
        onLogin={form.handleLogin}
      />

      <PublishSuccessToast isVisible={form.showSuccess} />
    </div>
  )
}
