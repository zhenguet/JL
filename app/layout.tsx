import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Minna no Nihongo - Ứng dụng học tiếng Nhật',
  description: 'Học từ vựng Minna no Nihongo với flashcard và bài tập',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}

