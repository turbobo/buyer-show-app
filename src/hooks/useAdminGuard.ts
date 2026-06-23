'use client'

import { useEffect, useState } from 'react'
import { useUserStore } from '@/store/user'
import { USER_ROLE, USER_STATUS } from '@/lib/constants'

export type AdminGuardState =
  | { status: 'loading' }
  | { status: 'unauthorized'; reason: 'not-logged-in' | 'not-admin' | 'banned' }
  | { status: 'granted' }

/**
 * 管理员权限守卫 Hook
 * 用于 /admin/* 页面：等待会话恢复后校验登录 + role='admin' + status≠'banned'。
 * 返回 { state, user }，UI 根据 state 渲染 loading / 权限提示 / 内容。
 */
export function useAdminGuard(): { state: AdminGuardState } {
  const { user, isLoggedIn, authReady } = useUserStore()
  const [state, setState] = useState<AdminGuardState>({ status: 'loading' })

  useEffect(() => {
    if (!authReady) {
      setState({ status: 'loading' })
      return
    }
    if (!isLoggedIn || !user) {
      setState({ status: 'unauthorized', reason: 'not-logged-in' })
      return
    }
    if (user.status === USER_STATUS.BANNED) {
      setState({ status: 'unauthorized', reason: 'banned' })
      return
    }
    if (user.role !== USER_ROLE.ADMIN) {
      setState({ status: 'unauthorized', reason: 'not-admin' })
      return
    }
    setState({ status: 'granted' })
  }, [authReady, isLoggedIn, user])

  return { state }
}
