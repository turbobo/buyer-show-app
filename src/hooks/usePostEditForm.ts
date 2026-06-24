import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchPostDetail, updatePost } from '@/services/post'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'

export function usePostEditForm() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string
  const user = useUserStore((s) => s.user)
  const isLoggedIn = useUserStore((s) => s.isLoggedIn)
  const authReady = useUserStore((s) => s.authReady)

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

  return {
    postId,
    router,
    loading,
    authReady,
    submitting,
    showSuccess,
    unauthorized,
    notFound,
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
    handleSubmit,
    hasHistory,
  }
}
