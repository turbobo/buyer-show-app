import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'
import type { User } from '@/types'

/**
 * Supabase 快捷登录（匿名）
 * 登录成功返回 User，失败返回 null
 */
export async function quickLogin(): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) throw error

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profile) {
        const user = profile as User
        useUserStore.getState().setUser(user)
        return user
      }
    }
    return null
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '登录失败'
    useUIStore.getState().addToast('error', message)
    return null
  }
}

/**
 * 退出登录
 */
export async function quickLogout(): Promise<void> {
  await supabase.auth.signOut()
  useUserStore.getState().logout()
}
