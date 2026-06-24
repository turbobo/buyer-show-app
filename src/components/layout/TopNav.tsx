'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { smartBack } from '@/lib/nav-helpers'

const NAV_ITEMS = [
  { href: '/', label: '发现' },
  { href: '/search', label: '搜索' },
  { href: '/publish', label: '发布' },
  { href: '/profile', label: '我的' },
]

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const isDetail = pathname.startsWith('/post/') || pathname.startsWith('/user/')
    || (pathname.startsWith('/profile/') && pathname !== '/profile')
  const backFallback = pathname.startsWith('/profile/') ? '/profile' : '/'

  return (
    <header
      className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-14 bg-white/95 backdrop-blur-lg border-b border-gray-100 items-center justify-center"
      role="banner"
    >
      <div className="flex items-center justify-between w-full md:max-w-3xl lg:max-w-5xl xl:max-w-6xl px-5 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          {isDetail && (
            <button
              onClick={() => smartBack(router, backFallback)}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center mr-2 transition-colors"
              aria-label="返回上一页"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <Link href="/" aria-label="买家说首页" className="flex items-center gap-2">
            <img src="/logo.svg" alt="买家说" width={32} height={32} loading="lazy" />
            <span className="text-xl font-extrabold tracking-tight" style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A5C 50%, #FFAB87 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              买家说
            </span>
            <span className="text-tiny text-gray-400 tracking-wide hidden lg:inline">
              真实购物体验 · 好物发现社区
            </span>
          </Link>
        </div>

        {/* Nav links (hidden on detail pages) */}
        {!isDetail && (
          <nav className="flex items-center gap-1" aria-label="主导航">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href
              const isPublish = item.href === '/publish'

              if (isPublish) {
                return (
                  <motion.div key={item.href} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href={item.href}
                      className="px-5 py-1.5 rounded-full text-sm font-medium text-white bg-gradient-to-r from-coral-500 to-coral-400 shadow-coral"
                      aria-label={item.label}
                    >
                      + {item.label}
                    </Link>
                  </motion.div>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-full text-body font-medium transition-all duration-200 ${
                    active
                      ? 'text-coral-500 bg-coral-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                  {active && (
                    <motion.div
                      layoutId="nav-dot"
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-coral-500"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>
        )}

        <div className="w-24 shrink-0" />
      </div>
    </header>
  )
}
