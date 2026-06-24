'use client'

import { motion } from 'framer-motion'
import ImageUploader from '@/components/ImageUploader'
import StarRating from '@/components/StarRating'
import { HOT_TAGS } from '@/lib/mock-data'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

interface PublishFormState {
  images: string[]
  title: string
  content: string
  productName: string
  price: string
  rating: number
  selectedTags: string[]
}

interface PublishFormActions {
  setImages: (images: string[]) => void
  setTitle: (title: string) => void
  setContent: (content: string) => void
  setProductName: (name: string) => void
  setPrice: (price: string) => void
  setRating: (rating: number) => void
  toggleTag: (tag: string) => void
}

interface Props {
  formState: PublishFormState
  formActions: PublishFormActions
}

export default function PublishFormSections({ formState, formActions }: Props) {
  const { images, title, content, productName, price, rating, selectedTags } = formState
  const { setImages, setTitle, setContent, setProductName, setPrice, setRating, toggleTag } = formActions

  return (
    <div className="space-y-6 md:max-w-2xl md:mx-auto">
      {/* ── Section: Images ── */}
      <motion.section custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          商品图片
          <span className="text-gray-400 font-normal ml-1.5">（最多 9 张）</span>
        </label>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <ImageUploader images={images} onChange={setImages} max={9} />
        </div>
      </motion.section>

      {/* ── Section: Title ── */}
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

      {/* ── Section: Content ── */}
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

      {/* ── Section: Product Info ── */}
      <motion.section custom={3} variants={sectionVariants} initial="hidden" animate="visible">
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
      <motion.section custom={4} variants={sectionVariants} initial="hidden" animate="visible">
        <label className="block text-sm font-medium text-gray-700 mb-3">商品评分</label>
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center">
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>
      </motion.section>

      {/* ── Section: Tags ── */}
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
  )
}
