'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode, useState } from 'react'
import { AlphabetButton, Button } from '@/components'
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
    { path: '/', label: t.navigation.home, isHome: true },
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
      <Button
        variant="secondary"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
        className="lesson-menu-toggle"
      >
        {isMenuOpen ? `✕ ${lessonNumber}` : '☰'}
      </Button>
      {isMenuOpen && (
        <div className="lesson-menu-overlay" onClick={() => setIsMenuOpen(false)} />
      )}
      <aside className={`lesson-sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="lesson-sidebar-header">
          <div className="lesson-sidebar-header-logo-container">
            <Link href="/" className="lesson-sidebar-header-logo-link">
              <img 
                src="/JL/logo.png" 
                alt="Home" 
                className="lesson-logo"
              />
            </Link>
            <h2 className="lesson-sidebar-title">{t.common.lesson} {lessonNumber}</h2>
          </div>
          <Button
            variant="secondary"
            onClick={() => setIsMenuOpen(false)}
            aria-label={t.common.close}
            className="lesson-sidebar-close"
          >
            ✕
          </Button>
        </div>
        <div className="lesson-sidebar-content">
          <nav className="lesson-sidebar-nav">
            {menuItems.map((item) => {
              const href = item.isHome ? item.path : `/lesson/${lessonNumber}/${item.path}`
              const isActive = item.isHome 
                ? pathname === '/'
                : item.path === 'exercise' 
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
          <div className="lesson-sidebar-footer">
            <div className="lesson-sidebar-language-container">
              <LanguageSwitcher />
            </div>
            <div className="lesson-sidebar-navigation">
              {prevLesson ? (
                <Button
                  variant="nav"
                  component={Link}
                  href={getPathForLesson(prevLesson)}
                  onClick={(e) => {
                    if (window.innerWidth <= 768) {
                      setIsMenuOpen(false)
                    }
                  }}
                >
                  ← {t.common.lesson} {prevLesson}
                </Button>
              ) : (
                <Button variant="nav" disabled>
                  ← {t.common.prev}
                </Button>
              )}
              {nextLesson ? (
                <Button
                  variant="nav"
                  component={Link}
                  href={getPathForLesson(nextLesson)}
                  onClick={(e) => {
                    if (window.innerWidth <= 768) {
                      setIsMenuOpen(false)
                    }
                  }}
                >
                  {t.common.lesson} {nextLesson} →
                </Button>
              ) : (
                <Button variant="nav" disabled>
                  {t.common.next} →
                </Button>
              )}
            </div>
          </div>
        </div>
      </aside>
      <div className={`lesson-container ${isMenuOpen ? 'menu-open' : ''}`}>
        <div className="lesson-header-wrapper">
          <div className="lesson-header">
            <div className="lesson-header-logo-container">
              <Link href="/" className="lesson-header-logo-link">
                <img 
                  src="/JL/logo.png" 
                  alt="Home" 
                  className="lesson-logo"
                />
              </Link>
              <h1 className="lesson-title">{t.common.lesson} {lessonNumber}</h1>
            </div>
            <div className="lesson-navigation">
              {prevLesson ? (
                <Button
                  variant="nav"
                  component={Link}
                  href={getPathForLesson(prevLesson)}
                >
                  ← {t.common.lesson} {prevLesson}
                </Button>
              ) : (
                <Button variant="nav" disabled>
                  ← {t.common.prev}
                </Button>
              )}
              {nextLesson ? (
                <Button
                  variant="nav"
                  component={Link}
                  href={getPathForLesson(nextLesson)}
                >
                  {t.common.lesson} {nextLesson} →
                </Button>
              ) : (
                <Button variant="nav" disabled>
                  {t.common.next} →
                </Button>
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

