import type { NextRouter } from 'next/router'

/**
 * 智能返回：优先走 router.back()（保留滚动位、转场动画），
 * 无历史记录时 fallback 到 router.replace(fallback)。
 *
 * 判断标准：window.history.length <= 1（新标签/外链直达）或 document.referrer 为空。
 * 注意：history.length 在某些 SPA 跳转后可能不准，配合 referrer 双重判断。
 */
export function smartBack(
  router: { back: () => void; replace: (href: string) => void },
  fallback: string = '/',
): void {
  if (typeof window === 'undefined') {
    router.replace(fallback)
    return
  }
  const hasHistory = window.history.length > 1
  const hasReferrer = document.referrer.length > 0
  if (hasHistory && hasReferrer) {
    router.back()
  } else {
    router.replace(fallback)
  }
}

/**
 * 仅判断当前是否"有历史可回"。
 * 用于 UI 层决定是否显示返回按钮（避免误触 replace）。
 */
export function canGoBack(): boolean {
  if (typeof window === 'undefined') return false
  return window.history.length > 1 && document.referrer.length > 0
}
