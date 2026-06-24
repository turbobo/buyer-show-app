import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/services/post'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'
import { openLoginSheet } from '@/lib/auth-helpers'

export function usePublishForm() {
  const router = useRouter()
  const isLoggedIn = useUserStore((s) => s.isLoggedIn)
  const authReady = useUserStore((s) => s.authReady)

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

  // Check login on mount（等 session 恢复完成后再判断）
  useEffect(() => {
    if (!authReady) return
    if (!isLoggedIn) {
      setShowLoginPrompt(true)
    }
  }, [authReady, isLoggedIn])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < 3
          ? [...prev, tag]
          : prev,
    )
  }

  const handleLogin = () => {
    openLoginSheet('发布内容')
  }

  const handleCloseLoginPrompt = () => {
    setShowLoginPrompt(false)
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
    if (!isLoggedIn) {
      setShowLoginPrompt(true)
      return
    }

    setSubmitting(true)
    try {
      await createPost({
        title: trimmedTitle,
        content: trimmedContent,
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

  return {
    images,
    setImages,
    title,
    setTitle,
    content,
    setContent,
    productName,
    setProductName,
    price,
    setPrice,
    rating,
    setRating,
    selectedTags,
    toggleTag,
    showLoginPrompt,
    handleCloseLoginPrompt,
    showSuccess,
    submitting,
    handleLogin,
    handleSubmit,
  }
}
