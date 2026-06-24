import type { Metadata } from 'next'
import './globals.css'
import GlobalUI from '@/components/ui/GlobalUI'
import AuthProvider from '@/components/AuthProvider'
import ConditionalNav from '@/components/layout/ConditionalNav'
import BannedScreen from '@/components/BannedScreen'

export const metadata: Metadata = {
  title: '买家说 - 真实购物分享社区',
  description: '分享你的购物体验，发现好物推荐',
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          <ConditionalNav>{children}</ConditionalNav>
          <GlobalUI />
          <BannedScreen />
        </AuthProvider>
      </body>
    </html>
  )
}
