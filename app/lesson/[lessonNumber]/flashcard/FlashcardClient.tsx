'use client'

import { useState, useEffect, useRef } from 'react'
import { vocabularyData } from '@/data/vocabulary'
import { VocabularyWord } from '@/types/vocabulary'
import { EmptyMessage, PageTitle, ProgressBar } from '@/components'
import { useI18n } from '@/i18n/context'
import './flashcard.css'

interface FlashcardClientProps {
  lessonNumber: number
}

export default function FlashcardClient({ lessonNumber }: FlashcardClientProps) {
  const { t } = useI18n()
  const vocabulary = vocabularyData[lessonNumber] || []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [shuffledWords, setShuffledWords] = useState<VocabularyWord[]>([])
  const [cardHeight, setCardHeight] = useState<number>(400)
  const [practiceMode, setPracticeMode] = useState<'view' | 'fill'>('view')
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const hiddenCardsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (vocabulary.length > 0) {
      const shuffled = [...vocabulary].sort(() => Math.random() - 0.5)
      setShuffledWords(shuffled)
    }
  }, [vocabulary])

  useEffect(() => {
    const calculateHeight = () => {
      if (hiddenCardsRef.current && shuffledWords.length > 0) {
        const hiddenContainer = hiddenCardsRef.current
        const cards = hiddenContainer.querySelectorAll('.hidden-card')
        let maxHeight = 400
        cards.forEach((card) => {
          const cardElement = card.querySelector('.card') as HTMLElement
          if (cardElement) {
            const front = cardElement.querySelector('.card-front') as HTMLElement
            const back = cardElement.querySelector('.card-back') as HTMLElement
            if (front) {
              const frontHeight = front.getBoundingClientRect().height
              if (frontHeight > maxHeight) {
                maxHeight = frontHeight
              }
            }
            if (back) {
              const backHeight = back.getBoundingClientRect().height
              if (backHeight > maxHeight) {
                maxHeight = backHeight
              }
            }
          }
        })
        if (practiceMode === 'fill') {
          maxHeight = Math.max(maxHeight, 450)
        }
        setCardHeight(maxHeight)
      }
    }

    const timeoutId = setTimeout(() => {
      calculateHeight()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [shuffledWords, practiceMode])

  useEffect(() => {
    if (practiceMode === 'fill' && inputRef.current && !showResult) {
      inputRef.current.focus()
    }
  }, [currentIndex, practiceMode, showResult])

  if (vocabulary.length === 0) {
    return (
      <div className="flashcard-container">
        <PageTitle title={t.flashcard.title} lessonNumber={lessonNumber} />
        <EmptyMessage message={`${t.flashcard.noData} ${lessonNumber}`} />
      </div>
    )
  }

  if (shuffledWords.length === 0) {
    return (
      <div className="flashcard-container">
        <PageTitle title={t.flashcard.title} lessonNumber={lessonNumber} />
        <EmptyMessage message={t.common.loading} />
      </div>
    )
  }

  const currentWord = shuffledWords[currentIndex]
  if (!currentWord) {
    return (
      <div className="flashcard-container">
        <PageTitle title={t.flashcard.title} lessonNumber={lessonNumber} />
        <EmptyMessage message={t.common.loading} />
      </div>
    )
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleNext = () => {
    setIsFlipped(false)
    setUserAnswer('')
    setShowResult(false)
    setCurrentIndex((prev) => (prev + 1) % shuffledWords.length)
    if (practiceMode === 'fill' && inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setUserAnswer('')
    setShowResult(false)
    setCurrentIndex(
      (prev) => (prev - 1 + shuffledWords.length) % shuffledWords.length
    )
    if (practiceMode === 'fill' && inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleShuffle = () => {
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5)
    setShuffledWords(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
    setUserAnswer('')
    setShowResult(false)
  }

  const normalizeAnswer = (answer: string): string => {
    return answer.trim().toLowerCase().replace(/\s+/g, ' ')
  }

  const checkAnswer = () => {
    const normalizedUserAnswer = normalizeAnswer(userAnswer)
    const normalizedCorrectAnswer = normalizeAnswer(currentWord.vi)
    const correct = normalizedUserAnswer === normalizedCorrectAnswer
    setIsCorrect(correct)
    setShowResult(true)
  }

  const handleModeChange = (mode: 'view' | 'fill') => {
    setPracticeMode(mode)
    setIsFlipped(false)
    setUserAnswer('')
    setShowResult(false)
    if (mode === 'fill' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const shouldShowHiragana = (word: VocabularyWord): boolean => {
    return !word.kanji || word.kanji !== word.hiragana
  }

  return (
    <div className="flashcard-container">
      <div
        ref={hiddenCardsRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          top: '-9999px',
          left: '-9999px',
          width: '500px',
          maxWidth: '100%',
        }}
      >
        {shuffledWords.map((word, idx) => (
          <div key={idx} className="hidden-card" style={{ marginBottom: '20px' }}>
            <div className="card" style={{ position: 'relative', height: 'auto', minHeight: 'auto' }}>
              <div className="card-front" style={{ position: 'relative', height: 'auto' }}>
                <div className="card-content">
                  {shouldShowHiragana(word) && (
                    <div className="word-hiragana">{word.hiragana}</div>
                  )}
                  {word.kanji ? (
                    <div className="word-kanji">{word.kanji}</div>
                  ) : null}
                  <div className="card-hint">{t.flashcard.clickToView}</div>
                </div>
              </div>
              <div className="card-back" style={{ position: 'relative', height: 'auto' }}>
                <div className="card-content">
                  <div className="word-meaning">{word.vi}</div>
                  <div className="word-type">{word.type}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PageTitle title={t.flashcard.title} lessonNumber={lessonNumber} />

      <div className="flashcard-controls">
        <button onClick={handleShuffle} className="btn btn-secondary">
          {t.common.shuffle}
        </button>
        <button
          onClick={() => handleModeChange('view')}
          className={`btn ${practiceMode === 'view' ? 'btn-primary' : 'btn-secondary'}`}
        >
          {t.flashcard.viewMeaning}
        </button>
        <button
          onClick={() => handleModeChange('fill')}
          className={`btn ${practiceMode === 'fill' ? 'btn-primary' : 'btn-secondary'}`}
        >
          {t.flashcard.fillMeaning}
        </button>
      </div>

      <ProgressBar
        current={currentIndex + 1}
        total={shuffledWords.length}
        className="flashcard-progress"
      />

      {practiceMode === 'view' ? (
        <div className="card-wrapper" onClick={handleFlip} ref={cardRef}>
          <div
            className={`card ${isFlipped ? 'flipped' : ''}`}
            style={{ height: `${cardHeight}px` }}
          >
            <div className="card-front">
              <div className="card-content">
                {shouldShowHiragana(currentWord) && (
                  <div className="word-hiragana">{currentWord.hiragana}</div>
                )}
                {currentWord.kanji ? (
                  <div className="word-kanji">{currentWord.kanji}</div>
                ) : null}
                <div className="card-hint">{t.flashcard.clickToView}</div>
              </div>
            </div>
            <div className="card-back">
              <div className="card-content">
                <div className="word-meaning">{currentWord.vi}</div>
                <div className="word-type">{currentWord.type}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-wrapper fill-mode" ref={cardRef}>
          <div
            className="card fill-card"
            style={{ height: `${cardHeight}px` }}
          >
            <div className="card-front">
              <div className="card-content">
                {shouldShowHiragana(currentWord) && (
                  <div className="word-hiragana">{currentWord.hiragana}</div>
                )}
                {currentWord.kanji ? (
                  <div className="word-kanji">{currentWord.kanji}</div>
                ) : null}
                <div className="fill-input-container">
                  <div className="fill-input-wrapper">
                    <input
                      ref={inputRef}
                      type="text"
                      value={userAnswer}
                      onChange={(e) => {
                        setUserAnswer(e.target.value)
                        setShowResult(false)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !showResult) {
                          checkAnswer()
                        }
                      }}
                      placeholder={t.flashcard.enterMeaning}
                      className="fill-input"
                      disabled={showResult}
                    />
                    {showResult && (
                      <span className={`fill-result-icon ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? '✓' : '✗'}
                      </span>
                    )}
                  </div>
                  {showResult && !isCorrect && (
                    <div className="correct-answer-hint">
                      Đáp án: {currentWord.vi}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card-navigation">
        <button onClick={handlePrev} className="btn btn-nav">
          ← {t.common.prev}
        </button>
        {practiceMode === 'view' ? (
          <button onClick={handleFlip} className="btn btn-primary">
            {isFlipped ? t.flashcard.hideMeaning : t.flashcard.viewMeaning}
          </button>
        ) : (
          <button
            onClick={checkAnswer}
            className="btn btn-primary"
            disabled={!userAnswer.trim() || showResult}
          >
            {showResult ? t.flashcard.checked : t.common.check}
          </button>
        )}
        <button onClick={handleNext} className="btn btn-nav">
          {t.common.next} →
        </button>
      </div>
    </div>
  )
}

