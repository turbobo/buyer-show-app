'use client'

import { useTagsPage } from '@/hooks/useTagsPage'
import TagsTable from '@/components/admin/TagsTable'
import TagModals from '@/components/admin/TagModals'

export default function AdminTagsPage() {
  const {
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
  } = useTagsPage()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">标签管理</h2>
          <p className="text-sm text-gray-500 mt-1">
            共 <span className="font-num text-coral-500 font-semibold">{total}</span> 个标签
          </p>
        </div>
      </div>

      <TagsTable
        loading={loading}
        tags={tags}
        search={search}
        setSearch={setSearch}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        hasMore={hasMore}
        onCreate={() => setCreateOpen(true)}
        onRename={(tag) => setRenameTag(tag)}
        onMerge={(tag) => setMergeTag(tag)}
        onDelete={(tag) => setDeleteTag(tag)}
      />

      <TagModals
        createOpen={createOpen}
        setCreateOpen={setCreateOpen}
        renameTag={renameTag}
        setRenameTag={setRenameTag}
        mergeTag={mergeTag}
        setMergeTag={setMergeTag}
        deleteTag={deleteTag}
        setDeleteTag={setDeleteTag}
        busy={busy}
        handleCreate={handleCreate}
        handleRename={handleRename}
        handleMerge={handleMerge}
        handleDelete={handleDelete}
      />
    </div>
  )
}
