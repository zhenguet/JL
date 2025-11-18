'use client'

import { useState, useEffect } from 'react'
import { vocabularyData } from '@/data/vocabulary'
import { VocabularyWord } from '@/types/vocabulary'
import './flashcard.css'

interface PageProps {
  params: {
    lessonNumber: string
  }
}

export default function FlashcardPage({ params }: PageProps) {
  const lessonNumber = parseInt(params.lessonNumber, 10)
  const vocabulary = vocabularyData[lessonNumber] || []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [shuffledWords, setShuffledWords] = useState<VocabularyWord[]>([])
  const [showKanji, setShowKanji] = useState(true)

  useEffect(() => {
    if (vocabulary.length > 0) {
      const shuffled = [...vocabulary].sort(() => Math.random() - 0.5)
      setShuffledWords(shuffled)
    }
  }, [vocabulary])

  if (vocabulary.length === 0) {
    return (
      <div className="flashcard-container">
        <h2>Flashcard</h2>
        <p className="empty-message">
          Chưa có dữ liệu từ vựng cho bài {lessonNumber}
        </p>
      </div>
    )
  }

  if (shuffledWords.length === 0) {
    return (
      <div className="flashcard-container">
        <h2>Flashcard - Bài {lessonNumber}</h2>
        <p className="empty-message">Đang tải...</p>
      </div>
    )
  }

  const currentWord = shuffledWords[currentIndex]
  if (!currentWord) {
    return (
      <div className="flashcard-container">
        <h2>Flashcard - Bài {lessonNumber}</h2>
        <p className="empty-message">Đang tải...</p>
      </div>
    )
  }

  const progress = ((currentIndex + 1) / shuffledWords.length) * 100

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
      <h2>Flashcard - Bài {lessonNumber}</h2>

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

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="progress-text">
        {currentIndex + 1} / {shuffledWords.length}
      </p>

      <div className="card-wrapper" onClick={handleFlip}>
        <div className={`card ${isFlipped ? 'flipped' : ''}`}>
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
              {showKanji && currentWord.kanji ? (
                <div className="word-kanji">{currentWord.kanji}</div>
              ) : null}
              <div className="word-hiragana">{currentWord.hiragana}</div>
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

