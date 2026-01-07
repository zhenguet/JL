'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { AlphabetButton } from '@/components'
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
    { path: 'grammar', label: 'Ngữ pháp' },
    { path: 'flashcard', label: 'Flashcard' },
    { path: 'exercise', label: 'Bài tập' },
    { path: 'quiz', label: 'Kiểm tra' },
  ]

  const currentLesson = parseInt(lessonNumber, 10)
  const prevLesson = currentLesson > 1 ? currentLesson - 1 : null
  const nextLesson = currentLesson < 50 ? currentLesson + 1 : null
  
  const getPathForLesson = (lessonNum: number) => {
    const pathParts = pathname.split('/')
    const currentSection = pathParts[pathParts.length - 1]
    const isExerciseRoute = pathParts[pathParts.length - 2] === 'exercise'
    
    if (isExerciseRoute) {
      return `/lesson/${lessonNum}/exercise/${currentSection}`
    }
    
    return `/lesson/${lessonNum}/${currentSection}`
  }

  return (
    <div className="lesson-page">
      <div className="lesson-container">
        <div className="lesson-header-wrapper">
          <div className="lesson-header">
            <Link href="/" className="back-button">
              ← Về trang chủ
            </Link>
            <h1 className="lesson-title">Bài {lessonNumber}</h1>
            <div className="lesson-navigation">
              {prevLesson ? (
                <Link
                  href={getPathForLesson(prevLesson)}
                  className="nav-lesson-btn prev-lesson"
                >
                  ← Bài {prevLesson}
                </Link>
              ) : (
                <span className="nav-lesson-btn prev-lesson disabled">← Bài trước</span>
              )}
              {nextLesson ? (
                <Link
                  href={getPathForLesson(nextLesson)}
                  className="nav-lesson-btn next-lesson"
                >
                  Bài {nextLesson} →
                </Link>
              ) : (
                <span className="nav-lesson-btn next-lesson disabled">Bài sau →</span>
              )}
            </div>
          </div>

          <nav className="lesson-nav">
            {menuItems.map((item) => {
              const href = `/lesson/${lessonNumber}/${item.path}`
              const isActive = item.path === 'exercise' 
                ? pathname.startsWith(href)
                : pathname === href
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
        </div>

        <div className="lesson-content">{children}</div>
      </div>

      <AlphabetButton />
    </div>
  )
}

