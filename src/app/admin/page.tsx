'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { adminFetchUsers } from '@/services/admin'

interface Stat {
  label: string
  value: number | string
  color: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 拉前 200 用户用于统计（MVP 够用；后续可加专用 RPC）
    Promise.all([
      adminFetchUsers(1).then((r) => r.total),
      adminFetchUsers(1, '').catch(() => ({ total: 0 })),
    ])
      .then(([totalUsers]) => {
        setStats([
          { label: '总用户数', value: totalUsers, color: 'from-coral-400 to-orange-400' },
          { label: '帖子数', value: '—', color: 'from-sky-400 to-blue-400' },
          { label: '评论数', value: '—', color: 'from-emerald-400 to-green-400' },
        ])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">总览</h2>
        <p className="text-sm text-gray-500 mt-1">社区核心指标与管理入口</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-5 border border-gray-100"
            >
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className={`mt-2 text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">快捷入口</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link href="/admin/users">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-xl p-5 border border-gray-100 hover:border-coral-200 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-coral-50 flex items-center justify-center text-coral-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">用户管理</p>
                  <p className="text-xs text-gray-400">查看 / 封禁 / 解封 / 提权</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/admin/tags">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-xl p-5 border border-gray-100 hover:border-coral-200 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-coral-50 flex items-center justify-center text-coral-500">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">标签管理</p>
                  <p className="text-xs text-gray-400">新建 / 重命名 / 合并 / 删除</p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  )
}
