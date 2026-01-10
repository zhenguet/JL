'use client'

import Link from 'next/link'
import { AlphabetButton } from '@/components'
import LanguageSwitcher from '@/components/LanguageSwitcher/LanguageSwitcher'
import { useI18n } from '@/i18n/context'
import './home.css'

export default function HomePageClient() {
  const { t } = useI18n()
  const n5Lessons = Array.from({ length: 25 }, (_, i) => i + 1)
  const n4Lessons = Array.from({ length: 25 }, (_, i) => i + 26)

  return (
    <div className="home-page">
      <div className="home-language-switcher">
        <LanguageSwitcher />
      </div>
      <div className="home-container">
        <div className="logo-container">
          <img src="/JL/logo.png" alt="JL Logo" className="app-logo" />
        </div>
        <h1>Minna no Nihongo</h1>
        <p className="subtitle">{t.home.selectLesson}</p>
        
        <div className="level-section">
          <h2 className="level-title">N5</h2>
          <div className="lessons-grid">
            {n5Lessons.map((lesson) => (
              <Link
                key={lesson}
                href={`/lesson/${lesson}/vocabulary`}
                className="lesson-card"
              >
                {t.home.lesson} {lesson}
              </Link>
            ))}
          </div>
        </div>

        <div className="level-section">
          <h2 className="level-title">N4</h2>
          <div className="lessons-grid">
            {n4Lessons.map((lesson) => (
              <Link
                key={lesson}
                href={`/lesson/${lesson}/vocabulary`}
                className="lesson-card"
              >
                {t.home.lesson} {lesson}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <AlphabetButton />
    </div>
  )
}
