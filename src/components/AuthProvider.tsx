'use client'

import { useAuthInit } from '@/hooks/useAuthInit'

/**
 * 全局认证 Provider
 * - 必须在 RootLayout 挂载，保证任何路由刷新都触发 session 恢复
 * - 不阻塞渲染：authReady=false 时仍然渲染 children，业务页面通过 useUserStore.authReady 自行决定 loading 显示
 *   这样既避免首屏白屏，又不会出现"已登录但闪一下未登录"
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthInit()
  return <>{children}</>
}
