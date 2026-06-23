'use client'

import { usePathname } from 'next/navigation'
import TabBar from '@/components/layout/TabBar'
import TopNav from '@/components/layout/TopNav'

interface Props {
  children: React.ReactNode
}

/**
 * 根据路由路径决定是否渲染 TopNav / TabBar。
 * - /admin/* 路径：隐藏 TopNav / TabBar，main 区不预留底部/顶部间距。
 * - 其他路径：正常渲染。
 */
export default function ConditionalNav({ children }: Props) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin') === true

  if (isAdmin) {
    return (
      <>
        <div className="mx-auto w-full max-w-6xl min-h-screen">
          <main>{children}</main>
        </div>
      </>
    )
  }

  return (
    <>
      <TopNav />
      <div className="mx-auto w-full max-w-[430px] md:max-w-3xl lg:max-w-5xl xl:max-w-6xl min-h-screen">
        <main className="pb-20 md:pb-6 md:pt-16">
          {children}
        </main>
        <TabBar />
      </div>
    </>
  )
}
