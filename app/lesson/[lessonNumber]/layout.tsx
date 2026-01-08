'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useState } from 'react'
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
  const [isMenuOpen, setIsMenuOpen] = useState(true)

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
    <div className={`lesson-page ${isMenuOpen ? 'menu-open' : ''}`}>
      <button
        type="button"
        className="lesson-menu-toggle"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? `✕ ${lessonNumber}` : '☰'}
      </button>
      {isMenuOpen && (
        <div className="lesson-menu-overlay" onClick={() => setIsMenuOpen(false)} />
      )}
      <aside className={`lesson-sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="lesson-sidebar-header">
          <h2 className="lesson-sidebar-title">Bài {lessonNumber}</h2>
          <button
            type="button"
            className="lesson-sidebar-close"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <div className="lesson-sidebar-content">
          <Link
            href="/"
            className="lesson-sidebar-back"
            onClick={(e) => {
              if (window.innerWidth <= 768) {
                setIsMenuOpen(false)
              }
            }}
          >
            ← Về trang chủ
          </Link>
          <nav className="lesson-sidebar-nav">
            {menuItems.map((item) => {
              const href = `/lesson/${lessonNumber}/${item.path}`
              const isActive = item.path === 'exercise' 
                ? pathname.startsWith(href)
                : pathname === href
              return (
                <Link
                  key={item.path}
                  href={href}
                  className={`lesson-sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={(e) => {
                    if (window.innerWidth <= 768) {
                      setIsMenuOpen(false)
                    }
                  }}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="lesson-sidebar-navigation">
            {prevLesson ? (
              <Link
                href={getPathForLesson(prevLesson)}
                className="lesson-sidebar-nav-btn prev"
                onClick={(e) => {
                  if (window.innerWidth <= 768) {
                    setIsMenuOpen(false)
                  }
                }}
              >
                ← Bài {prevLesson}
              </Link>
            ) : (
              <span className="lesson-sidebar-nav-btn prev disabled">← Bài trước</span>
            )}
            {nextLesson ? (
              <Link
                href={getPathForLesson(nextLesson)}
                className="lesson-sidebar-nav-btn next"
                onClick={(e) => {
                  if (window.innerWidth <= 768) {
                    setIsMenuOpen(false)
                  }
                }}
              >
                Bài {nextLesson} →
              </Link>
            ) : (
              <span className="lesson-sidebar-nav-btn next disabled">Bài sau →</span>
            )}
          </div>
        </div>
      </aside>
      <div className={`lesson-container ${isMenuOpen ? 'menu-open' : ''}`}>
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

