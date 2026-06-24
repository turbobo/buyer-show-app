'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { USER_ROLE } from '@/lib/constants'
import type { User } from '@/types'

interface MenuItem {
  label: string
  href: string | null
  icon: React.ReactNode
  color: string
}

const MENU_ITEMS: MenuItem[] = [
  {
    label: '编辑资料',
    href: '/profile/edit',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    color: 'from-pink-400 to-rose-400',
  },
  {
    label: '我的发布',
    href: '/profile/posts',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    color: 'from-coral-400 to-orange-400',
  },
  {
    label: '我的收藏',
    href: '/profile/favorites',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
    ),
    color: 'from-amber-400 to-yellow-400',
  },
  {
    label: '我的评论',
    href: '/profile/comments',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    color: 'from-sky-400 to-blue-400',
  },
  {
    label: '关注与粉丝',
    href: '/profile/follow',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    color: 'from-teal-400 to-emerald-400',
  },
  {
    label: '修改密码',
    href: '/profile/change-password',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
    color: 'from-violet-400 to-purple-400',
  },
  {
    label: '设置',
    href: null,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    color: 'from-gray-400 to-gray-500',
  },
]

const ADMIN_MENU_ITEM: MenuItem = {
  label: '管理后台',
  href: '/admin',
  icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  color: 'from-indigo-400 to-violet-400',
}

function getMenuItems(isAdmin: boolean): MenuItem[] {
  return isAdmin ? [ADMIN_MENU_ITEM, ...MENU_ITEMS] : MENU_ITEMS
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

interface Props {
  user: User
  onMenuClick: (href: string | null, label: string) => void
}

export default function ProfileMenu({ user, onMenuClick }: Props) {
  const items = getMenuItems(user.role === USER_ROLE.ADMIN)

  return (
    <>
      {/* ── Stats Bar ── */}
      <motion.div
        custom={0}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl shadow-sm p-5 mb-5"
      >
        <div className="grid grid-cols-3">
          {[
            { value: user.post_count, label: '发布' },
            { value: user.follower_count, label: '粉丝' },
            { value: user.following_count, label: '关注' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="flex flex-col items-center justify-center"
            >
              <span className="text-xl font-bold text-gray-800 font-num tabular-nums">
                {stat.value >= 1000
                  ? `${(stat.value / 1000).toFixed(1)}k`
                  : stat.value}
              </span>
              <span className="text-xs text-gray-400 mt-0.5">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Menu Items ── */}
      <motion.div
        custom={1}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl shadow-sm overflow-hidden mb-5"
      >
        {items.map((item, i) => (
          <motion.button
            key={item.label}
            whileTap={{ backgroundColor: '#f9f5f2' }}
            onClick={() => onMenuClick(item.href, item.label)}
            className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors ${
              i < items.length - 1 ? 'border-b border-gray-50' : ''
            }`}
          >
            <div className={`w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-sm`}>
              {item.icon}
            </div>
            <span className="flex-1 min-w-0 text-sm font-medium text-gray-700 truncate">
              {item.label}
            </span>
            <svg
              className="shrink-0 text-gray-300"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </motion.button>
        ))}
      </motion.div>
    </>
  )
}
