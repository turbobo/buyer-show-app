import { supabase } from '@/lib/supabase'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'

/**
 * 打开登录面板（触发 LoginSheet → 跳转登录页）
 */
export function openLoginSheet(reason: string = '点赞评论'): void {
  useUIStore.getState().openLoginSheet(reason)
}

/**
 * 退出登录
 */
export async function quickLogout(): Promise<void> {
  await supabase.auth.signOut()
  useUserStore.getState().logout()
}
