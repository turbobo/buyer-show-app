import { useCallback } from 'react'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'

/**
 * 权限守卫 Hook
 * 包装需要登录才能执行的操作，未登录时弹出登录引导 Sheet
 */
export function useAuthGuard() {
  const isLoggedIn = useUserStore((s) => s.isLoggedIn)
  const openLoginSheet = useUIStore((s) => s.openLoginSheet)

  const guard = useCallback(
    (action: () => void, reason = '点赞评论') => {
      if (isLoggedIn) {
        action()
      } else {
        openLoginSheet(reason, action)
      }
    },
    [isLoggedIn, openLoginSheet],
  )

  return { isLoggedIn, guard }
}
