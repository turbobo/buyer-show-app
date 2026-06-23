'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminFetchActiveTagOptions, type AdminTag } from '@/services/admin'

/* ───────── Modal 容器 ───────── */

export function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center px-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

/* ───────── 新建 / 重命名标签 Modal ───────── */

export function TagFormModal({
  title,
  initialName,
  initialDescription,
  busy,
  onSubmit,
  onClose,
}: {
  title: string
  initialName: string
  initialDescription: string
  busy: boolean
  onSubmit: (name: string, description: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const valid = name.trim().length >= 1 && name.trim().length <= 20

  return (
    <ModalShell onClose={onClose}>
      <h3 className="text-base font-semibold text-gray-800 mb-4">{title}</h3>
      <label className="block text-xs text-gray-500 mb-1">
        名称 <span className="text-coral-500">*</span>
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value.slice(0, 20))}
        placeholder="1-20 字"
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-coral-300"
        autoFocus
      />
      <p className="text-[11px] text-gray-400 mt-1 text-right">{name.length}/20</p>

      <label className="block text-xs text-gray-500 mb-1 mt-3">描述（选填）</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value.slice(0, 100))}
        placeholder="简短说明标签用途..."
        rows={2}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-coral-300 resize-none"
      />

      <div className="flex gap-2 mt-5">
        <button
          disabled={busy}
          onClick={onClose}
          className="flex-1 py-2 rounded-lg text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
        >
          取消
        </button>
        <button
          disabled={busy || !valid}
          onClick={() => onSubmit(name.trim(), description.trim())}
          className="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-coral-500 shadow-sm shadow-coral-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? '处理中...' : '确认'}
        </button>
      </div>
    </ModalShell>
  )
}

/* ───────── 合并标签 Modal ───────── */

export function MergeModal({
  source,
  busy,
  onConfirm,
  onClose,
}: {
  source: AdminTag
  busy: boolean
  onConfirm: (targetId: string) => void
  onClose: () => void
}) {
  const [options, setOptions] = useState<Array<{ id: string; name: string }>>([])
  const [targetId, setTargetId] = useState<string>('')
  const [loadingOptions, setLoadingOptions] = useState(true)

  useEffect(() => {
    adminFetchActiveTagOptions()
      .then((list) => setOptions(list.filter((t) => t.id !== source.id)))
      .catch(() => {})
      .finally(() => setLoadingOptions(false))
  }, [source.id])

  return (
    <ModalShell onClose={onClose}>
      <h3 className="text-base font-semibold text-gray-800 mb-2">合并标签</h3>
      <p className="text-xs text-gray-500 mb-4">
        把 <span className="text-coral-500 font-medium">#{source.name}</span> 的所有引用转移到目标标签，源标签归档。
      </p>

      <label className="block text-xs text-gray-500 mb-1">目标标签</label>
      {loadingOptions ? (
        <div className="h-10 bg-gray-50 rounded animate-pulse" />
      ) : options.length === 0 ? (
        <p className="text-xs text-gray-400 py-3">没有其他 active 标签可供选择</p>
      ) : (
        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-coral-300 bg-white"
        >
          <option value="">请选择...</option>
          {options.map((t) => (
            <option key={t.id} value={t.id}>
              #{t.name}
            </option>
          ))}
        </select>
      )}

      <div className="flex gap-2 mt-5">
        <button
          disabled={busy}
          onClick={onClose}
          className="flex-1 py-2 rounded-lg text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
        >
          取消
        </button>
        <button
          disabled={busy || !targetId}
          onClick={() => onConfirm(targetId)}
          className="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-coral-500 shadow-sm shadow-coral-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? '合并中...' : '确认合并'}
        </button>
      </div>
    </ModalShell>
  )
}

/* ───────── 危险操作确认 Modal ───────── */

export function ConfirmModal({
  title,
  description,
  confirmText,
  danger,
  busy,
  onConfirm,
  onClose,
}: {
  title: string
  description: string
  confirmText: string
  danger?: boolean
  busy: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-start gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            danger ? 'bg-red-100' : 'bg-coral-100'
          }`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={danger ? '#EF4444' : '#FF6B35'}
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          disabled={busy}
          onClick={onClose}
          className="flex-1 py-2 rounded-lg text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 disabled:opacity-50"
        >
          取消
        </button>
        <button
          disabled={busy}
          onClick={onConfirm}
          className={`flex-1 py-2 rounded-lg text-sm font-medium text-white shadow-sm disabled:opacity-50 ${
            danger ? 'bg-red-500 shadow-red-200/50' : 'bg-coral-500 shadow-coral-200/50'
          }`}
        >
          {busy ? '处理中...' : confirmText}
        </button>
      </div>
    </ModalShell>
  )
}
