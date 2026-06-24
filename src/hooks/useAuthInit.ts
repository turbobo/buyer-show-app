'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/user'
import type { User } from '@/types'

/**
 * 应用启动时的认证初始化（在根布局挂载一次即可）：
 * 1. 调用 supabase.auth.getSession() 从 localStorage 恢复已有会话
 * 2. 同步用户 profile 到 Zustand
 * 3. 订阅 onAuthStateChange，处理 token 续签 / 登录 / 退出
 *
 * 主流 App 模式：会话恢复必须放在最顶层，保证任何路由刷新都触发 rehydrate；
 * 通过 store.authReady 标记防止首屏闪一下未登录。
 */
export function useAuthInit() {
  const setUser = useUserStore((s) => s.setUser)
  const setAuthReady = useUserStore((s) => s.setAuthReady)
  const authReady = useUserStore((s) => s.authReady)

  useEffect(() => {
    let cancelled = false

    async function loadProfile(userId: string) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) {
        console.error('[auth] load profile failed:', error.message)
        return null
      }
      return profile as User
    }

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (cancelled) return

        if (session?.user) {
          const profile = await loadProfile(session.user.id)
          if (!cancelled && profile) setUser(profile)
        }
      } catch (err) {
        console.error('[auth] init error:', err)
      } finally {
        if (!cancelled) setAuthReady(true)
      }
    }

    init()

    // 订阅认证状态变化（token 续签 / 主动登录 / 退出 / 多 tab 同步）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return

      // 退出 / 会话失效 → 清空
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null)
        return
      }

      // 登录 / 续签 / 用户更新 → 同步 profile
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        const profile = await loadProfile(session.user.id)
        if (!cancelled && profile) setUser(profile)
      }

      // 密码重置回调 — reset-password 页面自行监听此事件处理表单，
      // 这里不把 recovery session 当正常登录同步 profile
      if (event === 'PASSWORD_RECOVERY') {
        return
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [setUser, setAuthReady])

  return { ready: authReady }
}
