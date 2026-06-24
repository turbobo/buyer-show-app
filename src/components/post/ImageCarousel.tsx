'use client'

import { motion } from 'framer-motion'

interface Props {
  images: string[]
  title: string
  currentSlide: number
  carouselRef: React.RefObject<HTMLDivElement>
  handleCarouselScroll: () => void
}

export default function ImageCarousel({
  images,
  title,
  currentSlide,
  carouselRef,
  handleCarouselScroll,
}: Props) {
  if (images.length === 0) {
    return (
      <div
        className="w-full bg-gradient-to-br from-coral-100 to-coral-50 flex items-center justify-center"
        style={{ aspectRatio: '4/3' }}
      >
        <span className="text-4xl text-coral-300">📷</span>
      </div>
    )
  }

  return (
    <>
      <div
        ref={carouselRef}
        onScroll={handleCarouselScroll}
        className="flex overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="w-full shrink-0 snap-center relative bg-gray-100"
            style={{ aspectRatio: '4/3' }}
          >
            <img
              src={src}
              alt={`${title} - ${i + 1}`}
              className="w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i === currentSlide ? 18 : 6,
                  backgroundColor: i === currentSlide ? '#FF6B35' : 'rgba(255,255,255,0.6)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="h-1.5 rounded-full"
              />
            ))}
          </div>
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded-full">
            {currentSlide + 1} / {images.length}
          </div>
        </>
      )}
    </>
  )
}
