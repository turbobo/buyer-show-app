import type { Metadata } from 'next'
import './globals.css'
import TabBar from '@/components/layout/TabBar'
import TopNav from '@/components/layout/TopNav'

export const metadata: Metadata = {
  title: '买家说 - 真实购物分享社区',
  description: '分享你的购物体验，发现好物推荐',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        {/* PC 顶部导航栏 */}
        <TopNav />
        <div className="mx-auto w-full max-w-[430px] md:max-w-3xl lg:max-w-5xl xl:max-w-6xl min-h-screen">
          <main className="pb-20 md:pb-6 md:pt-16">
            {children}
          </main>
          {/* 移动端底部 TabBar */}
          <TabBar />
        </div>
      </body>
    </html>
  )
}
