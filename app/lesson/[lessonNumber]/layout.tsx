'use client';

import { AlphabetButton, AlphabetModal, Button } from '@/components';
import LanguageSwitcher from '@/components/LanguageSwitcher/LanguageSwitcher';
import { useI18n } from '@/i18n/context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import './lesson.css';

export default function LessonLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { lessonNumber: string };
}) {
  const lessonNumber = params.lessonNumber;
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAlphabetModalOpen, setIsAlphabetModalOpen] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(true);
      } else {
        setIsMenuOpen(false);
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const menuItems = [
    { path: '/', label: t.navigation.home, isHome: true },
    { path: 'vocabulary', label: t.navigation.vocabulary },
    { path: 'grammar', label: t.navigation.grammar },
    { path: 'flashcard', label: t.navigation.flashcard },
    { path: 'exercise', label: t.navigation.exercise },
    { path: 'quiz', label: t.navigation.quiz },
  ];

  const currentLesson = parseInt(lessonNumber, 10);
  const prevLesson = currentLesson > 1 ? currentLesson - 1 : null;
  const nextLesson = currentLesson < 50 ? currentLesson + 1 : null;

  const getPathForLesson = (lessonNum: number) => {
    const pathParts = pathname.split('/').filter((part) => part !== '');
    const isExerciseRoute =
      pathParts.length >= 3 && pathParts[2] === 'exercise';

    if (isExerciseRoute) {
      const exerciseType = pathParts[3] || '';
      return `/lesson/${lessonNum}/exercise/${exerciseType}`;
    }

    const currentSection = pathParts[2] || 'vocabulary';
    return `/lesson/${lessonNum}/${currentSection}`;
  };

  return (
    <div className={`lesson-page ${isMenuOpen ? 'menu-open' : ''}`}>
      <header className="lesson-header-bar">
        <Button
          variant="primary"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
          className="lesson-menu-toggle"
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </Button>
        <div className="lesson-header-logo-container">
          <Link href="/" className="lesson-header-logo-link">
            <img src="/JL/logo.png" alt="Home" className="lesson-logo" />
          </Link>
          <h1 className="lesson-header-title">
            {t.common.lesson} {lessonNumber}
          </h1>
        </div>
        <div className="lesson-header-language-container">
          <LanguageSwitcher />
        </div>
      </header>
      {isMenuOpen && (
        <div
          className="lesson-menu-overlay"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      <aside className={`lesson-sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="lesson-sidebar-header">
          <Button
            variant="secondary"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Toggle menu"
            className="lesson-sidebar-menu-toggle"
          >
            <CloseIcon />
          </Button>
          <div className="lesson-sidebar-header-logo-container">
            <Link href="/" className="lesson-sidebar-header-logo-link">
              <img src="/JL/logo.png" alt="Home" className="lesson-logo" />
            </Link>
            <h2 className="lesson-sidebar-title">
              {t.common.lesson} {lessonNumber}
            </h2>
          </div>
        </div>
        <div className="lesson-sidebar-content">
          <nav className="lesson-sidebar-nav">
            {menuItems.map((item) => {
              const href = item.isHome
                ? item.path
                : `/lesson/${lessonNumber}/${item.path}`;
              const isActive = item.isHome
                ? pathname === '/'
                : item.path === 'exercise'
                ? pathname.startsWith(href)
                : pathname === href;
              return (
                <Link
                  key={item.path}
                  href={href}
                  className={`lesson-sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={(e) => {
                    if (window.innerWidth <= 768) {
                      setIsMenuOpen(false);
                    }
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              className="lesson-sidebar-item lesson-sidebar-alphabet-btn"
              onClick={() => {
                setIsAlphabetModalOpen(true);
                if (window.innerWidth <= 768) {
                  setIsMenuOpen(false);
                }
              }}
            >
              {t.alphabet.alphabet}
            </button>
          </nav>
        </div>
        <div className="lesson-sidebar-footer">
          <div className="lesson-sidebar-navigation">
            {prevLesson ? (
              <Button
                variant="nav"
                component={Link}
                href={getPathForLesson(prevLesson)}
                className="lesson-sidebar-nav-btn"
                onClick={(e) => {
                  if (window.innerWidth <= 768) {
                    setIsMenuOpen(false);
                  }
                }}
              >
                <div className="nav-btn-content">
                  <span className="nav-btn-arrow">←</span>
                  <span className="nav-btn-label">{t.common.prev}</span>
                </div>
              </Button>
            ) : (
              <Button variant="nav" disabled className="lesson-sidebar-nav-btn">
                <div className="nav-btn-content">
                  <span className="nav-btn-arrow">←</span>
                  <span className="nav-btn-label">{t.common.prev}</span>
                </div>
              </Button>
            )}
            {nextLesson ? (
              <Button
                variant="nav"
                component={Link}
                href={getPathForLesson(nextLesson)}
                className="lesson-sidebar-nav-btn"
                onClick={(e) => {
                  if (window.innerWidth <= 768) {
                    setIsMenuOpen(false);
                  }
                }}
              >
                <div className="nav-btn-content">
                  <span className="nav-btn-label">{t.common.lesson}</span>
                  <span className="nav-btn-number">{nextLesson} →</span>
                </div>
              </Button>
            ) : (
              <Button variant="nav" disabled className="lesson-sidebar-nav-btn">
                <div className="nav-btn-content">
                  <span className="nav-btn-label">{t.common.lesson}</span>
                  <span className="nav-btn-number">{t.common.next} →</span>
                </div>
              </Button>
            )}
          </div>
        </div>
      </aside>
      <div className={`lesson-container ${isMenuOpen ? 'menu-open' : ''}`}>
        <div className="lesson-header-wrapper">
          <div className="lesson-header">
            <div className="lesson-header-logo-container">
              <Link href="/" className="lesson-header-logo-link">
                <img src="/JL/logo.png" alt="Home" className="lesson-logo" />
              </Link>
              <h1 className="lesson-title">
                {t.common.lesson} {lessonNumber}
              </h1>
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
              const href = `/lesson/${lessonNumber}/${item.path}`;
              const isActive =
                item.path === 'exercise'
                  ? pathname.startsWith(href)
                  : pathname === href;
              return (
                <Link
                  key={item.path}
                  href={href}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="lesson-content">{children}</div>
      </div>

      <AlphabetButton />
      <AlphabetModal
        isOpen={isAlphabetModalOpen}
        onClose={() => setIsAlphabetModalOpen(false)}
      />
    </div>
  );
}
