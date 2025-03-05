import type { Metadata, Viewport } from 'next'
import './globals.css'
import 'antd-mobile/bundle/style.css'

export const metadata: Metadata = {
  title: '消息发送系统',
  description: '一个安全的基于Web的消息发送系统，具有用户认证和批量消息发送功能',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}
