'use client'

import { motion } from 'framer-motion'
import type { AdminTag } from '@/services/admin'
import { TAG_STATUS } from '@/lib/constants'

interface Props {
  loading: boolean
  tags: AdminTag[]
  search: string
  setSearch: (v: string) => void
  page: number
  setPage: (updater: (p: number) => number) => void
  totalPages: number
  hasMore: boolean
  onCreate: () => void
  onRename: (tag: AdminTag) => void
  onMerge: (tag: AdminTag) => void
  onDelete: (tag: AdminTag) => void
}

export default function TagsTable(props: Props) {
  const {
    loading,
    tags,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    hasMore,
    onCreate,
    onRename,
    onMerge,
    onDelete,
  } = props

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* 搜索 + 新建 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="按名称搜索..."
            className="pl-9 pr-4 py-2 w-56 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-coral-300"
          />
        </div>
        <button
          onClick={onCreate}
          className="px-4 py-2 text-sm font-medium text-white bg-coral-500 rounded-lg shadow-sm shadow-coral-200/50 hover:bg-coral-600"
        >
          + 新建标签
        </button>
      </div>

      {loading ? (
        <div className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-50 rounded animate-pulse" />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <div className="p-12 text-center text-sm text-gray-400">
          没有找到标签，点击右上角「新建标签」创建
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">名称</th>
              <th className="text-left text-xs font-medium text-gray-500 px-3 py-3 hidden md:table-cell">
                描述
              </th>
              <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">引用数</th>
              <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">状态</th>
              <th className="text-right text-xs font-medium text-gray-500 px-5 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <motion.tr
                key={tag.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-5 py-3">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-coral-500">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    {tag.name}
                  </span>
                </td>
                <td className="px-3 py-3 text-gray-500 text-xs hidden md:table-cell max-w-[200px] truncate">
                  {tag.description || <span className="text-gray-300">—</span>}
                </td>
                <td className="px-3 py-3 font-num text-gray-700">{tag.usage_count}</td>
                <td className="px-3 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 text-[11px] rounded font-medium ${
                      tag.status === TAG_STATUS.ACTIVE
                        ? 'bg-emerald-50 text-emerald-500'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {tag.status === TAG_STATUS.ACTIVE ? '启用' : '已归档'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => onRename(tag)}
                      className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                    >
                      重命名
                    </button>
                    <button
                      onClick={() => onMerge(tag)}
                      className="px-2.5 py-1 text-xs text-coral-500 hover:bg-coral-50 rounded"
                    >
                      合并
                    </button>
                    <button
                      onClick={() => onDelete(tag)}
                      className="px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 rounded"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && tags.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            第 <span className="font-num text-gray-600">{page}</span> /{' '}
            <span className="font-num text-gray-600">{totalPages}</span> 页
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 text-xs border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50"
            >
              上一页
            </button>
            <button
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 text-xs border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
