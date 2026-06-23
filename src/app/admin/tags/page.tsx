'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  adminFetchTags,
  adminCreateTag,
  adminRenameTag,
  adminMergeTag,
  adminDeleteTag,
  type AdminTag,
} from '@/services/admin'
import { useUIStore } from '@/store/ui'
import { TAG_STATUS } from '@/lib/constants'
import { TagFormModal, MergeModal, ConfirmModal } from './modals'

const PAGE_SIZE = 20

export default function AdminTagsPage() {
  const addToast = useUIStore((s) => s.addToast)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [tags, setTags] = useState<AdminTag[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [renameTag, setRenameTag] = useState<AdminTag | null>(null)
  const [mergeTag, setMergeTag] = useState<AdminTag | null>(null)
  const [deleteTag, setDeleteTag] = useState<AdminTag | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const reload = () => {
    setLoading(true)
    adminFetchTags(page, debouncedSearch || undefined)
      .then((res) => {
        setTags(res.list)
        setTotal(res.total)
        setHasMore(res.hasMore)
      })
      .catch((err: unknown) => addToast('error', err instanceof Error ? err.message : '加载失败'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch])

  const handleCreate = async (name: string, description: string) => {
    setBusy(true)
    try {
      await adminCreateTag(name, description)
      addToast('success', `已创建标签 #${name}`)
      setCreateOpen(false)
      reload()
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : '创建失败')
    } finally {
      setBusy(false)
    }
  }

  const handleRename = async (newName: string) => {
    if (!renameTag) return
    setBusy(true)
    try {
      await adminRenameTag(renameTag.id, newName)
      addToast('success', `已重命名为 #${newName}`)
      setRenameTag(null)
      reload()
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : '重命名失败')
    } finally {
      setBusy(false)
    }
  }

  const handleMerge = async (targetId: string) => {
    if (!mergeTag) return
    setBusy(true)
    try {
      await adminMergeTag(mergeTag.id, targetId)
      addToast('success', `已合并 #${mergeTag.name} → 目标标签`)
      setMergeTag(null)
      reload()
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : '合并失败')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTag) return
    setBusy(true)
    try {
      await adminDeleteTag(deleteTag.id)
      addToast('success', `已删除 #${deleteTag.name}`)
      setDeleteTag(null)
      reload()
    } catch (err: unknown) {
      addToast('error', err instanceof Error ? err.message : '删除失败')
    } finally {
      setBusy(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">标签管理</h2>
          <p className="text-sm text-gray-500 mt-1">
            共 <span className="font-num text-coral-500 font-semibold">{total}</span> 个标签
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            onClick={() => setCreateOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-coral-500 rounded-lg shadow-sm shadow-coral-200/50 hover:bg-coral-600"
          >
            + 新建标签
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
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
                        onClick={() => setRenameTag(tag)}
                        className="px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                      >
                        重命名
                      </button>
                      <button
                        onClick={() => setMergeTag(tag)}
                        className="px-2.5 py-1 text-xs text-coral-500 hover:bg-coral-50 rounded"
                      >
                        合并
                      </button>
                      <button
                        onClick={() => setDeleteTag(tag)}
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

      <AnimatePresence>
        {createOpen && (
          <TagFormModal
            title="新建标签"
            initialName=""
            initialDescription=""
            busy={busy}
            onSubmit={handleCreate}
            onClose={() => !busy && setCreateOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {renameTag && (
          <TagFormModal
            title={`重命名 #${renameTag.name}`}
            initialName={renameTag.name}
            initialDescription={renameTag.description}
            busy={busy}
            onSubmit={handleRename}
            onClose={() => !busy && setRenameTag(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mergeTag && (
          <MergeModal
            source={mergeTag}
            busy={busy}
            onConfirm={handleMerge}
            onClose={() => !busy && setMergeTag(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTag && (
          <ConfirmModal
            title={`删除 #${deleteTag.name}？`}
            description={`将从所有引用该标签的帖子中移除，标签本身进入软删除。当前被 ${deleteTag.usage_count} 个帖子引用。`}
            confirmText="确认删除"
            danger
            busy={busy}
            onConfirm={handleDelete}
            onClose={() => !busy && setDeleteTag(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
