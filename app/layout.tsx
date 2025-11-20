import type { Metadata } from 'next'
import './globals.css'
import ThemeRegistry from './theme/ThemeRegistry'

export const metadata: Metadata = {
  title: 'Minna no Nihongo - Ứng dụng học tiếng Nhật',
  description: 'Học từ vựng Minna no Nihongo với flashcard và bài tập',
  icons: {
    icon: '/JL/logo.png',
    shortcut: '/JL/logo.png',
    apple: '/JL/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  )
}

