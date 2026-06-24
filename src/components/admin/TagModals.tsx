'use client'

import { AnimatePresence } from 'framer-motion'
import type { AdminTag } from '@/services/admin'
import { TagFormModal, MergeModal, ConfirmModal } from '@/app/admin/tags/modals'

interface Props {
  createOpen: boolean
  setCreateOpen: (v: boolean) => void
  renameTag: AdminTag | null
  setRenameTag: (t: AdminTag | null) => void
  mergeTag: AdminTag | null
  setMergeTag: (t: AdminTag | null) => void
  deleteTag: AdminTag | null
  setDeleteTag: (t: AdminTag | null) => void
  busy: boolean
  handleCreate: (name: string, description: string) => Promise<void>
  handleRename: (newName: string) => Promise<void>
  handleMerge: (targetId: string) => Promise<void>
  handleDelete: () => Promise<void>
}

export default function TagModals(props: Props) {
  const {
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
  } = props

  return (
    <>
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
    </>
  )
}
