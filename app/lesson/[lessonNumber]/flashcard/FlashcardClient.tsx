'use client'

import { useState, useEffect, useRef } from 'react'
import { vocabularyData } from '@/data/vocabulary'
import { VocabularyWord } from '@/types/vocabulary'
import { EmptyMessage, PageTitle, ProgressBar } from '@/components'
import './flashcard.css'

interface FlashcardClientProps {
  lessonNumber: number
}

export default function FlashcardClient({ lessonNumber }: FlashcardClientProps) {
  const vocabulary = vocabularyData[lessonNumber] || []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [shuffledWords, setShuffledWords] = useState<VocabularyWord[]>([])
  const [showKanji, setShowKanji] = useState(true)
  const [cardHeight, setCardHeight] = useState<number>(400)
  const cardRef = useRef<HTMLDivElement>(null)
  const hiddenCardsRef = useRef<HTMLDivElement>(null)

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
        setCardHeight(maxHeight)
      }
    }

    const timeoutId = setTimeout(() => {
      calculateHeight()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [shuffledWords, showKanji])

  if (vocabulary.length === 0) {
    return (
      <div className="flashcard-container">
        <PageTitle title="Flashcard" lessonNumber={lessonNumber} />
        <EmptyMessage message={`Chưa có dữ liệu từ vựng cho bài ${lessonNumber}`} />
      </div>
    )
  }

  if (shuffledWords.length === 0) {
    return (
      <div className="flashcard-container">
        <PageTitle title="Flashcard" lessonNumber={lessonNumber} />
        <EmptyMessage message="Đang tải..." />
      </div>
    )
  }

  const currentWord = shuffledWords[currentIndex]
  if (!currentWord) {
    return (
      <div className="flashcard-container">
        <PageTitle title="Flashcard" lessonNumber={lessonNumber} />
        <EmptyMessage message="Đang tải..." />
      </div>
    )
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % shuffledWords.length)
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setCurrentIndex(
      (prev) => (prev - 1 + shuffledWords.length) % shuffledWords.length
    )
  }

  const handleShuffle = () => {
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5)
    setShuffledWords(shuffled)
    setCurrentIndex(0)
    setIsFlipped(false)
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
                  {showKanji && word.kanji ? (
                    <div className="word-kanji">{word.kanji}</div>
                  ) : null}
                  <div className="word-hiragana">{word.hiragana}</div>
                  <div className="card-hint">Click để xem nghĩa</div>
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

      <PageTitle title="Flashcard" lessonNumber={lessonNumber} />

      <div className="flashcard-controls">
        <button onClick={handleShuffle} className="btn btn-secondary">
          Xáo trộn
        </button>
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={showKanji}
            onChange={(e) => setShowKanji(e.target.checked)}
          />
          Hiển thị Kanji
        </label>
      </div>

      <ProgressBar
        current={currentIndex + 1}
        total={shuffledWords.length}
        className="flashcard-progress"
      />

      <div className="card-wrapper" onClick={handleFlip} ref={cardRef}>
        <div
          className={`card ${isFlipped ? 'flipped' : ''}`}
          style={{ height: `${cardHeight}px` }}
        >
          <div className="card-front">
            <div className="card-content">
              {showKanji && currentWord.kanji ? (
                <div className="word-kanji">{currentWord.kanji}</div>
              ) : null}
              <div className="word-hiragana">{currentWord.hiragana}</div>
              <div className="card-hint">Click để xem nghĩa</div>
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

      <div className="card-navigation">
        <button onClick={handlePrev} className="btn btn-nav">
          ← Trước
        </button>
        <button onClick={handleFlip} className="btn btn-primary">
          {isFlipped ? 'Ẩn nghĩa' : 'Xem nghĩa'}
        </button>
        <button onClick={handleNext} className="btn btn-nav">
          Sau →
        </button>
      </div>
    </div>
  )
}

