'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { href: '/', label: '发现', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/search', label: '搜索' },
  { href: '/publish', label: '发布' },
  { href: '/profile', label: '我的' },
]

export default function TopNav() {
  const pathname = usePathname()

  // 详情页不显示导航
  if (pathname.startsWith('/post/')) return null

  return (
    <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-14 bg-white/95 backdrop-blur-lg border-b border-gray-100 items-center justify-center">
      <div className="flex items-center justify-between w-full max-w-5xl px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-extrabold tracking-tight" style={{
            background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A5C 50%, #FFAB87 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            买家说
          </span>
          <span className="text-[10px] text-gray-400 tracking-wide hidden lg:inline">
            真实购物体验 · 好物发现社区
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'text-coral-500 bg-coral-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
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

        {/* Right side placeholder for future: search, notifications */}
        <div className="w-24 shrink-0" />
      </div>
    </header>
  )
}
