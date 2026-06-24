'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { type ReactNode } from 'react'
import { smartBack } from '@/lib/nav-helpers'

interface Props {
  title: string
  /** 右上角附加内容（如统计/筛选） */
  extra?: ReactNode
  children: ReactNode
}

/**
 * 个人中心子页通用布局：顶部返回栏 + 标题 + 内容区
 * 适配移动端（pt-12）和 PC（md:pt-20）。
 */
export default function ProfileSubPageLayout({ title, extra, children }: Props) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-warm-50 pb-24 md:pb-8">
      {/* 移动端顶部条（PC 由全局 TopNav 顶替） */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center h-12 px-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => smartBack(router, '/profile')}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"
            aria-label="返回"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </motion.button>
          <h1 className="flex-1 text-center text-base font-semibold text-gray-800 -ml-9">
            {title}
          </h1>
        </div>
      </header>

      <div className="px-5 pt-5 md:pt-8 md:px-8">
        {/* PC 端标题 */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-coral-500 to-coral-300" />
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          </div>
          {extra}
        </div>

        {/* 移动端附加 */}
        {extra && <div className="md:hidden mb-3">{extra}</div>}

        {children}
      </div>
    </div>
  )
}

/** 空状态占位 */
export function EmptyState({ icon, title, hint }: { icon?: ReactNode; title: string; hint?: string }) {
  return (
    <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
      <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
        {icon || (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      {hint && <p className="text-xs text-gray-300">{hint}</p>}
    </div>
  )
}

/** 骨架屏 */
export function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gray-100 animate-pulse" style={{ height: 200 + (i % 3) * 20 }} />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
