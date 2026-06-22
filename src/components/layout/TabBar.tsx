'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const TABS = [
  { href: '/', label: '发现', icon: 'home' },
  { href: '/search', label: '搜索', icon: 'search' },
  { href: '/publish', label: '发布', icon: 'publish' },
  { href: '/profile', label: '我的', icon: 'user' },
]

function TabIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? '#FF6B35' : '#9CA3AF'
  const sw = active ? 2.2 : 1.8

  if (type === 'home') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )

  if (type === 'search') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )

  if (type === 'publish') return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="2" y="2" width="24" height="24" rx="12" fill="#FF6B35" />
      <line x1="14" y1="8" x2="14" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="14" x2="20" y2="14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )

  if (type === 'user') return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )

  return null
}

export default function TabBar() {
  const pathname = usePathname()

  if (pathname.startsWith('/post/')) return null

  return (
    <nav
      className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-lg border-t border-gray-100 safe-bottom z-50"
      aria-label="底部导航"
    >
      <div className="flex items-center justify-around h-14">
        {TABS.map((tab) => {
          const active = pathname === tab.href
          const isPublish = tab.icon === 'publish'

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] ${
                isPublish ? '' : 'py-1'
              }`}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
            >
              {isPublish ? (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="-mt-5 shadow-coral rounded-full"
                >
                  <TabIcon type={tab.icon} active={false} />
                </motion.div>
              ) : (
                <>
                  <motion.div
                    animate={active ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <TabIcon type={tab.icon} active={active} />
                  </motion.div>
                  <span className={`text-tiny mt-0.5 ${active ? 'text-coral-500 font-medium' : 'text-gray-400'}`}>
                    {tab.label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute -bottom-1 w-5 h-0.5 rounded-full bg-coral-500"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
