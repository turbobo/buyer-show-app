'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { USER_ROLE } from '@/lib/constants'
import type { User } from '@/types'

interface MenuItem {
  label: string
  href?: string
  action?: string
  icon: React.ReactNode
  color: string
  danger?: boolean
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: '内容管理',
    items: [
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
        label: '我的点赞',
        href: '/profile/likes',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        ),
        color: 'from-rose-400 to-pink-400',
      },
    ],
  },
  {
    title: '社交互动',
    items: [
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
    ],
  },
  {
    title: '账号设置',
    items: [
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
        label: '退出登录',
        action: 'logout',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        ),
        color: 'from-gray-400 to-gray-500',
      },
      {
        label: '注销账号',
        action: 'deleteAccount',
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        ),
        color: 'from-red-400 to-red-500',
        danger: true,
      },
    ],
  },
]

const ADMIN_SECTION: MenuSection = {
  title: '管理',
  items: [
    {
      label: '管理后台',
      href: '/admin',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      color: 'from-indigo-400 to-violet-400',
    },
  ],
}

function getSections(isAdmin: boolean): MenuSection[] {
  return isAdmin ? [ADMIN_SECTION, ...MENU_SECTIONS] : MENU_SECTIONS
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export interface MenuClickPayload {
  href?: string
  action?: string
  label: string
}

interface Props {
  user: User
  onMenuClick: (payload: MenuClickPayload) => void
}

export default function ProfileMenu({ user, onMenuClick }: Props) {
  const sections = getSections(user.role === USER_ROLE.ADMIN)

  return (
    <>
      {/* Stats Bar */}
      <motion.div
        custom={0}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl shadow-sm mb-4 md:mb-5 overflow-hidden"
      >
        <div className="grid grid-cols-3 divide-x divide-gray-100">
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
              className="flex flex-col items-center justify-center py-5 md:py-6"
            >
              <span className="text-xl md:text-2xl font-bold text-gray-800 font-num tabular-nums">
                {stat.value >= 1000
                  ? `${(stat.value / 1000).toFixed(1)}k`
                  : stat.value}
              </span>
              <span className="text-xs md:text-sm text-gray-400 mt-1">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Menu Sections */}
      {sections.map((section, sIdx) => (
        <motion.div
          key={section.title}
          custom={sIdx + 1}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
          className="mb-4 md:mb-5 bg-white rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="flex items-center gap-2 px-5 md:px-6 py-3 md:py-3.5 border-b border-gray-100 bg-warm-50/40">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-coral-500 to-coral-300" />
            <h3 className="text-sm md:text-[15px] font-semibold text-gray-700">
              {section.title}
            </h3>
          </div>
          {section.items.map((item, i) => (
            <motion.button
              key={item.label}
              whileTap={{ backgroundColor: '#f9f5f2' }}
              onClick={() => onMenuClick({ href: item.href, action: item.action, label: item.label })}
              className={`w-full flex items-center gap-3 md:gap-4 px-5 md:px-6 py-3.5 md:py-4 text-left transition-colors hover:bg-warm-50 ${
                i < section.items.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div className={`w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-sm`}>
                {item.icon}
              </div>
              <span className={`flex-1 min-w-0 text-sm md:text-base font-medium truncate ${
                item.danger ? 'text-red-400' : 'text-gray-700'
              }`}>
                {item.label}
              </span>
              {!item.danger && (
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
              )}
            </motion.button>
          ))}
        </motion.div>
      ))}
    </>
  )
}
