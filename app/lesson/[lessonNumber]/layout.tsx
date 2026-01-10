'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useState } from 'react'
import { AlphabetButton } from '@/components'
import LanguageSwitcher from '@/components/LanguageSwitcher/LanguageSwitcher'
import { useI18n } from '@/i18n/context'
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
  const { t } = useI18n()

  const menuItems = [
    { path: 'vocabulary', label: t.navigation.vocabulary },
    { path: 'grammar', label: t.navigation.grammar },
    { path: 'flashcard', label: t.navigation.flashcard },
    { path: 'exercise', label: t.navigation.exercise },
    { path: 'quiz', label: t.navigation.quiz },
  ]

  const currentLesson = parseInt(lessonNumber, 10)
  const prevLesson = currentLesson > 1 ? currentLesson - 1 : null
  const nextLesson = currentLesson < 50 ? currentLesson + 1 : null
  
  const getPathForLesson = (lessonNum: number) => {
    const pathParts = pathname.split('/').filter(part => part !== '')
    const isExerciseRoute = pathParts.length >= 3 && pathParts[2] === 'exercise'
    
    if (isExerciseRoute) {
      const exerciseType = pathParts[3] || ''
      return `/lesson/${lessonNum}/exercise/${exerciseType}`
    }
    
    const currentSection = pathParts[2] || 'vocabulary'
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
          <h2 className="lesson-sidebar-title">{t.common.lesson} {lessonNumber}</h2>
          <button
            type="button"
            className="lesson-sidebar-close"
            onClick={() => setIsMenuOpen(false)}
            aria-label={t.common.close}
          >
            ✕
          </button>
        </div>
        <div className="lesson-sidebar-content">
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
          <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
              <LanguageSwitcher />
            </div>
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
                  ← {t.common.lesson} {prevLesson}
                </Link>
              ) : (
                <span className="lesson-sidebar-nav-btn prev disabled">← {t.common.prev}</span>
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
                  {t.common.lesson} {nextLesson} →
                </Link>
              ) : (
                <span className="lesson-sidebar-nav-btn next disabled">{t.common.next} →</span>
              )}
            </div>
          </div>
        </div>
      </aside>
      <div className={`lesson-container ${isMenuOpen ? 'menu-open' : ''}`}>
        <div className="lesson-header-wrapper">
          <div className="lesson-header">
            <h1 className="lesson-title">{t.common.lesson} {lessonNumber}</h1>
            <div className="lesson-navigation">
              {prevLesson ? (
                <Link
                  href={getPathForLesson(prevLesson)}
                  className="nav-lesson-btn prev-lesson"
                >
                  ← {t.common.lesson} {prevLesson}
                </Link>
              ) : (
                <span className="nav-lesson-btn prev-lesson disabled">← {t.common.prev}</span>
              )}
              {nextLesson ? (
                <Link
                  href={getPathForLesson(nextLesson)}
                  className="nav-lesson-btn next-lesson"
                >
                  {t.common.lesson} {nextLesson} →
                </Link>
              ) : (
                <span className="nav-lesson-btn next-lesson disabled">{t.common.next} →</span>
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

