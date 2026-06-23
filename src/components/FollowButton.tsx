'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toggleFollow } from '@/services/follow'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { useUIStore } from '@/store/ui'

interface Props {
  /** 目标用户 ID */
  targetUserId: string
  /** 初始是否已关注（由外层一次性注入） */
  initialFollowing?: boolean
  /** 关注/取关后回调（外部同步计数） */
  onChange?: (following: boolean) => void
  /** 尺寸：sm 用于卡片/列表，md 用于他人主页 */
  size?: 'sm' | 'md'
  /** 可选 className 覆盖 */
  className?: string
}

/**
 * 关注/取关按钮
 * 未登录点击 → 弹 LoginSheet；
 * 登录态 → 调 toggleFollow，更新本地状态 + 触发 onChange。
 */
export default function FollowButton({
  targetUserId,
  initialFollowing = false,
  onChange,
  size = 'sm',
  className,
}: Props) {
  const { guard } = useAuthGuard()
  const addToast = useUIStore((s) => s.addToast)
  const [following, setFollowing] = useState(initialFollowing)
  const [busy, setBusy] = useState(false)

  const handleClick = () => {
    guard(async () => {
      setBusy(true)
      try {
        const res = await toggleFollow(targetUserId)
        setFollowing(res.following)
        onChange?.(res.following)
      } catch (err: unknown) {
        addToast('error', err instanceof Error ? err.message : '操作失败')
      } finally {
        setBusy(false)
      }
    }, '关注')
  }

  const baseCls =
    size === 'md'
      ? 'px-5 py-2 text-sm font-semibold rounded-full shadow-sm transition-colors'
      : 'px-3 py-1 text-xs font-medium rounded-full transition-colors'

  const stateCls = following
    ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
    : 'bg-coral-500 text-white hover:bg-coral-600 shadow-coral-200/50'

  return (
    <motion.button
      whileTap={{ scale: busy ? 1 : 0.95 }}
      onClick={handleClick}
      disabled={busy}
      aria-label={following ? '取消关注' : '关注'}
      className={`${baseCls} ${stateCls} ${className ?? ''} disabled:opacity-60 disabled:cursor-wait`}
    >
      {busy ? (
        <span className="inline-flex items-center gap-1">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
            className={`inline-block border-2 border-current border-t-transparent rounded-full ${
              size === 'md' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'
            }`}
          />
          {following ? '取关中...' : '关注中...'}
        </span>
      ) : following ? (
        '已关注'
      ) : (
        '+ 关注'
      )}
    </motion.button>
  )
}
