'use client'

import { motion } from 'framer-motion'
import { usePostDetail } from '@/hooks/usePostDetail'
import MobileBackButton from '@/components/MobileBackButton'
import ImageCarousel from '@/components/post/ImageCarousel'
import PostDetailContent from '@/components/post/PostDetailContent'
import PostActionBar from '@/components/post/PostActionBar'
import CommentSection from '@/components/post/CommentSection'
import CommentInput from '@/components/post/CommentInput'

export default function PostDetailClient() {
  const {
    post,
    loading,
    router,
    isLiked,
    likeCount,
    isFavorited,
    favoriteCount,
    heartBeat,
    currentSlide,
    comments,
    commentText,
    setCommentText,
    submittingComment,
    carouselRef,
    guard,
    handleCarouselScroll,
    handleToggleLike,
    handleToggleFavorite,
    handleSubmitComment,
  } = usePostDetail()

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-coral-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-caption text-gray-400">加载中...</span>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-warm-50 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <span className="text-6xl block mb-4">📭</span>
          <h2 className="text-lg font-semibold text-gray-700">帖子不存在</h2>
          <p className="text-sm text-gray-400 mt-2">可能已被删除或链接无效</p>
          <button onClick={() => router.push('/')} className="btn-primary mt-6 text-sm">
            返回首页
          </button>
        </motion.div>
      </div>
    )
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: post.title,
    reviewBody: post.content,
    itemReviewed: { '@type': 'Product', name: post.product_name || post.title },
    reviewRating: { '@type': 'Rating', ratingValue: String(post.rating), bestRating: '5' },
    author: { '@type': 'Person', name: post.user?.nickname || '匿名' },
    datePublished: post.created_at,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-warm-50 pb-24 relative">
        <MobileBackButton />

        <div className="md:flex md:gap-6 md:px-8 md:pt-16">
          {/* Image Carousel */}
          <div className="relative md:w-1/2 md:sticky md:top-16 md:self-start md:rounded-2xl md:overflow-hidden md:shadow-lg">
            <ImageCarousel
              images={post.images}
              title={post.title}
              currentSlide={currentSlide}
              carouselRef={carouselRef}
              handleCarouselScroll={handleCarouselScroll}
            />
          </div>

          {/* Content (right column on desktop) */}
          <div className="px-5 -mt-4 relative z-10 md:w-1/2 md:mt-0 md:pt-0 md:px-0">
            <PostDetailContent post={post} />

            <PostActionBar
              isLiked={isLiked}
              likeCount={likeCount}
              isFavorited={isFavorited}
              favoriteCount={favoriteCount}
              heartBeat={heartBeat}
              handleToggleLike={handleToggleLike}
              handleToggleFavorite={handleToggleFavorite}
              guard={guard}
            />

            <CommentSection comments={comments} />
          </div>
        </div>

        <CommentInput
          commentText={commentText}
          setCommentText={setCommentText}
          submittingComment={submittingComment}
          handleSubmitComment={handleSubmitComment}
          guard={guard}
        />
      </div>
    </>
  )
}
