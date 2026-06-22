'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Post } from '@/types'

interface Props {
  post: Post
  index?: number
}

export default function PostCard({ post, index = 0 }: Props) {
  const coverUrl = post.images[0] || ''
  // 瀑布流：随机高度
  const heights = [200, 220, 240, 260, 180]
  const imgHeight = heights[index % heights.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link href={`/post/${post.id}`}>
        <div className="card mb-3">
          {/* 封面图 */}
          {coverUrl && (
            <div className="relative overflow-hidden" style={{ height: imgHeight }}>
              <img
                src={coverUrl}
                alt={post.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {post.images.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {post.images.length}图
                </div>
              )}
            </div>
          )}

          {/* 内容 */}
          <div className="p-3">
            <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
              {post.title}
            </h3>

            {post.price && (
              <span className="text-coral-500 font-bold text-sm mt-1 block">
                {post.price}
              </span>
            )}

            {/* 评分 */}
            <div className="flex items-center gap-0.5 mt-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-xs ${i < post.rating ? 'text-amber-400' : 'text-gray-200'}`}
                >
                  ★
                </span>
              ))}
            </div>

            {/* 标签 */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-[10px] text-coral-500 bg-coral-50 px-1.5 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 底部：用户 + 点赞 */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
              <div className="flex items-center gap-1.5">
                <img
                  src={post.user?.avatar_url || ''}
                  alt=""
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-[11px] text-gray-500 max-w-[80px] truncate">
                  {post.user?.nickname || '匿名'}
                </span>
              </div>
              <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                ♥ {post.like_count > 999 ? `${(post.like_count / 1000).toFixed(1)}k` : post.like_count}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
