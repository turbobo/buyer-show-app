import { useCallback } from 'react'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'
import { USER_STATUS } from '@/lib/constants'

export function useAuthGuard() {
  const isLoggedIn = useUserStore((s) => s.isLoggedIn)
  const user = useUserStore((s) => s.user)
  const openLoginSheet = useUIStore((s) => s.openLoginSheet)

  const guard = useCallback(
    (action: () => void, reason = '点赞评论') => {
      if (!isLoggedIn) {
        openLoginSheet(reason, action)
      } else if (user?.status === USER_STATUS.BANNED) {
        return
      } else {
        action()
      }
    },
    [isLoggedIn, user?.status, openLoginSheet],
  )

  return { isLoggedIn, guard }
}
