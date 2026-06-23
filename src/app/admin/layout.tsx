'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAdminGuard } from '@/hooks/useAdminGuard'
import { useUserStore } from '@/store/user'
import { openLoginSheet } from '@/lib/auth-helpers'

const NAV_ITEMS = [
  {
    label: '总览',
    href: '/admin',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: '用户管理',
    href: '/admin/users',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    label: '标签管理',
    href: '/admin/tags',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
]

interface Props {
  children: React.ReactNode
}

export default function AdminLayout({ children }: Props) {
  const router = useRouter()
  const { state } = useAdminGuard()
  const user = useUserStore((s) => s.user)

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          className="w-8 h-8 border-2 border-gray-300 border-t-coral-500 rounded-full"
        />
      </div>
    )
  }

  if (state.status === 'unauthorized') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-coral-100 flex items-center justify-center mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.8" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-gray-800 mb-1">
          {state.reason === 'not-logged-in'
            ? '未登录'
            : state.reason === 'banned'
              ? '账号已被封禁'
              : '无权访问管理后台'}
        </h1>
        <p className="text-sm text-gray-500 mb-5 max-w-xs">
          {state.reason === 'not-logged-in'
            ? '请先登录后再试'
            : state.reason === 'banned'
              ? '如有异议请联系管理员'
              : '该页面仅管理员可访问'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/')}
            className="px-5 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
          >
            返回首页
          </button>
          {state.reason === 'not-logged-in' && (
            <button
              onClick={() => openLoginSheet('访问管理后台')}
              className="px-5 py-2 rounded-full bg-coral-500 text-white text-sm shadow-md shadow-coral-200/50"
            >
              立即登录
            </button>
          )}
        </div>
      </div>
    )
  }

  // granted
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶栏 */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="返回前台">
              <motion.div whileTap={{ scale: 0.92 }} className="w-8 h-8 rounded-lg bg-gradient-to-br from-coral-500 to-coral-400 flex items-center justify-center text-white font-bold">
                买
              </motion.div>
            </Link>
            <div>
              <h1 className="text-sm font-semibold text-gray-800">管理后台</h1>
              <p className="text-[11px] text-gray-400">买家说 · Admin Console</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <img src={user?.avatar_url || ''} alt="" className="w-7 h-7 rounded-full object-cover" />
            <span className="hidden sm:inline">{user?.nickname}</span>
            <span className="px-1.5 py-0.5 rounded bg-coral-50 text-coral-500 font-medium">管理员</span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 */}
        <aside className="w-56 shrink-0 border-r border-gray-100 bg-white min-h-[calc(100vh-56px)] p-4">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors"
              >
                <span className="text-gray-400">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              返回前台
            </Link>
          </div>
        </aside>

        {/* 内容区 */}
        <main className="flex-1 p-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
