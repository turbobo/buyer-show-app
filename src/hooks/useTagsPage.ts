import { useEffect, useState } from 'react'
import {
  adminFetchTags,
  adminCreateTag,
  adminRenameTag,
  adminMergeTag,
  adminDeleteTag,
  type AdminTag,
} from '@/services/admin'
import { useUIStore } from '@/store/ui'

const PAGE_SIZE = 20

export function useTagsPage() {
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

  return {
    search,
    setSearch,
    page,
    setPage,
    tags,
    total,
    hasMore,
    loading,
    totalPages,
    createOpen,
    setCreateOpen,
    renameTag,
    setRenameTag,
    mergeTag,
    setMergeTag,
    deleteTag,
    setDeleteTag,
    busy,
    handleCreate,
    handleRename,
    handleMerge,
    handleDelete,
  }
}
