'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/user'
import type { User } from '@/types'

/**
 * 应用启动时：
 * 1. 恢复已有会话 / 匿名登录
 * 2. 同步用户资料到 Zustand
 */
export function useAuthInit() {
  const [ready, setReady] = useState(false)
  const setUser = useUserStore((s) => s.setUser)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        // 尝试恢复已有会话
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          // 无会话 → 匿名登录
          const { data, error } = await supabase.auth.signInAnonymously()
          if (error) {
            console.error('[auth] anonymous login failed:', error.message)
            setReady(true)
            return
          }
        }

        // 获取用户资料
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser && !cancelled) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()

          if (profile && !cancelled) {
            setUser(profile as User)
          }
        }
      } catch (err) {
        console.error('[auth] init error:', err)
      } finally {
        if (!cancelled) setReady(true)
      }
    }

    init()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && !cancelled) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile && !cancelled) {
          setUser(profile as User)
        }
      } else if (!cancelled) {
        setUser(null)
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [setUser])

  return { ready }
}
