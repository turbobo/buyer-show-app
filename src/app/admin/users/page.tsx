'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminFetchUsers, adminBan, adminUnban, adminPromote } from '@/services/admin'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'
import { USER_ROLE, USER_STATUS } from '@/lib/constants'
import type { User } from '@/types'

const PAGE_SIZE = 20

function fmtCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return `${n}`
}

export default function AdminUsersPage() {
  const currentUser = useUserStore((s) => s.user)
  const addToast = useUIStore((s) => s.addToast)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  // 搜索防抖 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // 拉列表
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    adminFetchUsers(page, debouncedSearch || undefined)
      .then((res) => {
        if (cancelled) return
        setUsers(res.list)
        setTotal(res.total)
        setHasMore(res.hasMore)
      })
      .catch((err: unknown) => {
        addToast('error', err instanceof Error ? err.message : '加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [page, debouncedSearch, addToast])

  const handleBan = (u: User) => {
    useUIStore.getState().openModal({
      title: `封禁 ${u.nickname}？`,
      description: '封禁后该用户的所有 active 帖子会被隐藏，且无法登录。',
      confirmText: '确认封禁',
      confirmDanger: true,
      onConfirm: async () => {
        setBusyId(u.id)
        try {
          await adminBan(u.id)
          addToast('success', `已封禁 ${u.nickname}`)
          setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, status: USER_STATUS.BANNED } : p)))
        } catch (err: unknown) {
          addToast('error', err instanceof Error ? err.message : '封禁失败')
        } finally {
          setBusyId(null)
        }
      },
    })
  }

  const handleUnban = async (u: User) => {
    setBusyId(u.id)
    try {
      await adminUnban(u.id)
      addToast('success', `已解封 ${u.nickname}`)
      setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, status: USER_STATUS.ACTIVE } : p)))
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : '解封失败')
    } finally {
      setBusyId(null)
    }
  }

  const handlePromote = (u: User) => {
    useUIStore.getState().openModal({
      title: `提权 ${u.nickname} 为管理员？`,
      description: '提权后该用户将获得管理后台的完整权限，请谨慎操作。',
      confirmText: '确认提权',
      confirmDanger: false,
      onConfirm: async () => {
        setBusyId(u.id)
        try {
          await adminPromote(u.id)
          addToast('success', `已将 ${u.nickname} 提权为管理员`)
          setUsers((prev) => prev.map((p) => (p.id === u.id ? { ...p, role: USER_ROLE.ADMIN } : p)))
        } catch (err: unknown) {
          addToast('error', err instanceof Error ? err.message : '提权失败')
        } finally {
          setBusyId(null)
        }
      },
    })
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">用户管理</h2>
          <p className="text-sm text-gray-500 mt-1">共 <span className="font-num text-coral-500 font-semibold">{total}</span> 位用户</p>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="按昵称或 ID 搜索..."
            className="pl-9 pr-4 py-2 w-64 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-coral-300 transition-colors"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-50 rounded animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">
            没有找到匹配的用户
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">用户</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 py-3 hidden md:table-cell">数据</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">角色</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">状态</th>
                <th className="text-right text-xs font-medium text-gray-500 px-5 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id
                  const isAdmin = u.role === USER_ROLE.ADMIN
                  const isBanned = u.status === USER_STATUS.BANNED
                  return (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar_url || ''} alt="" className="w-9 h-9 rounded-full object-cover" />
                          <div className="min-w-0">
                            <p className="text-sm text-gray-800 font-medium truncate">
                              {u.nickname || '未命名'}
                              {isSelf && <span className="ml-1.5 text-[10px] text-coral-500 font-normal">（我）</span>}
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono truncate">{u.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-num">
                          <span>{fmtCount(u.post_count)} 帖</span>
                          <span>{fmtCount(u.follower_count)} 粉</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-block px-2 py-0.5 text-[11px] rounded font-medium ${
                          isAdmin ? 'bg-coral-50 text-coral-500' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {isAdmin ? '管理员' : '用户'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-block px-2 py-0.5 text-[11px] rounded font-medium ${
                          isBanned ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                        }`}>
                          {isBanned ? '已封禁' : '正常'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          {!isAdmin && (
                            <button
                              disabled={busyId === u.id || isSelf}
                              onClick={() => handlePromote(u)}
                              className="px-2.5 py-1 text-xs text-coral-500 hover:bg-coral-50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              提权
                            </button>
                          )}
                          {isBanned ? (
                            <button
                              disabled={busyId === u.id || isSelf}
                              onClick={() => handleUnban(u)}
                              className="px-2.5 py-1 text-xs text-emerald-500 hover:bg-emerald-50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              解封
                            </button>
                          ) : (
                            <button
                              disabled={busyId === u.id || isSelf || isAdmin}
                              onClick={() => handleBan(u)}
                              className="px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              title={isAdmin ? '不能封禁管理员' : isSelf ? '不能封禁自己' : ''}
                            >
                              封禁
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        )}

        {/* 分页 */}
        {!loading && users.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              第 <span className="font-num text-gray-600">{page}</span> / <span className="font-num text-gray-600">{totalPages}</span> 页
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 text-xs border border-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                上一页
              </button>
              <button
                disabled={!hasMore}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 text-xs border border-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
