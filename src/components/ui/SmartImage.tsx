'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
  loading?: 'lazy' | 'eager'
  onClick?: () => void
  aspectRatio?: string
}

export default function SmartImage({
  src,
  alt,
  className = '',
  style,
  loading = 'lazy',
  onClick,
  aspectRatio,
}: Props) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  return (
    <div
      className={`relative overflow-hidden bg-gray-100 ${className}`}
      style={{ ...style, aspectRatio }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Loading skeleton */}
      {status === 'loading' && (
        <div className="absolute inset-0 skeleton" />
      )}

      {/* Error fallback */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span className="text-tiny mt-1">图片加载失败</span>
        </div>
      )}

      {/* Actual image */}
      <motion.img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
        loading={loading}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        initial={false}
        animate={status === 'loaded' ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
    </div>
  )
}
