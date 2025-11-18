'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import './lesson.css'

export default function LessonLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { lessonNumber: string }
}) {
  const lessonNumber = params.lessonNumber
  const pathname = usePathname()

  const menuItems = [
    { path: 'vocabulary', label: 'Từ vựng' },
    { path: 'flashcard', label: 'Flashcard' },
    { path: 'exercise', label: 'Bài tập' },
    { path: 'usage', label: 'Giải thích' },
  ]

  return (
    <div className="lesson-page">
      <div className="lesson-container">
        <div className="lesson-header">
          <Link href="/" className="back-button">
            ← Về trang chủ
          </Link>
          <h1>Bài {lessonNumber}</h1>
        </div>

        <nav className="lesson-nav">
          {menuItems.map((item) => {
            const href = `/lesson/${lessonNumber}/${item.path}`
            const isActive = pathname === href
            return (
              <Link
                key={item.path}
                href={href}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="lesson-content">{children}</div>
      </div>
    </div>
  )
}

