'use client'

import { useState, useEffect } from 'react'
import { vocabularyData } from '@/data/vocabulary'
import { VocabularyWord } from '@/types/vocabulary'
import './exercise.css'

interface ExerciseClientProps {
  lessonNumber: number
}

interface Exercise {
  type: string
  question: string
  answer: string
  kanji?: string
}

export default function ExerciseClient({ lessonNumber }: ExerciseClientProps) {
  const vocabulary = vocabularyData[lessonNumber] || []
  const [exerciseType, setExerciseType] = useState<'fill' | 'translate' | 'kanji'>('fill')
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  useEffect(() => {
    generateExercise()
  }, [exerciseType, vocabulary])

  const generateExercise = () => {
    if (vocabulary.length === 0) return

    const randomWord =
      vocabulary[Math.floor(Math.random() * vocabulary.length)]

    if (exerciseType === 'fill') {
      setCurrentExercise({
        type: 'fill',
        question: `Điền từ còn thiếu: "${randomWord.vi}" = ?`,
        answer: randomWord.hiragana,
        kanji: randomWord.kanji,
      })
    } else if (exerciseType === 'translate') {
      setCurrentExercise({
        type: 'translate',
        question: `Dịch sang tiếng Việt: "${randomWord.hiragana}"${randomWord.kanji ? ` (${randomWord.kanji})` : ''}`,
        answer: randomWord.vi,
      })
    } else if (exerciseType === 'kanji') {
      if (randomWord.kanji) {
        setCurrentExercise({
          type: 'kanji',
          question: `Kanji của "${randomWord.hiragana}" (${randomWord.vi}) là gì?`,
          answer: randomWord.kanji,
        })
      } else {
        generateExercise()
        return
      }
    }

    setUserAnswer('')
    setShowResult(false)
  }

  const handleSubmit = () => {
    if (!currentExercise || !userAnswer.trim()) return

    setShowResult(true)
    setTotal((prev) => prev + 1)

    const normalizedUserAnswer = userAnswer.trim().toLowerCase()
    const normalizedCorrectAnswer = currentExercise.answer.trim().toLowerCase()

    const answerParts = normalizedCorrectAnswer.split(/[,、]/).map((part) => part.trim())
    const correct = answerParts.some((part) => normalizedUserAnswer.includes(part) || part.includes(normalizedUserAnswer))

    setIsCorrect(correct)
    if (correct) {
      setScore((prev) => prev + 1)
    }
  }

  const handleNext = () => {
    generateExercise()
  }

  if (vocabulary.length === 0) {
    return (
      <div className="exercise-container">
        <h2>Bài tập</h2>
        <p className="empty-message">
          Chưa có dữ liệu từ vựng cho bài {lessonNumber}
        </p>
      </div>
    )
  }

  return (
    <div className="exercise-container">
      <h2>Bài tập - Bài {lessonNumber}</h2>

      <div className="exercise-type-selector">
        <button
          className={`type-btn ${exerciseType === 'fill' ? 'active' : ''}`}
          onClick={() => setExerciseType('fill')}
        >
          Điền từ
        </button>
        <button
          className={`type-btn ${exerciseType === 'translate' ? 'active' : ''}`}
          onClick={() => setExerciseType('translate')}
        >
          Dịch
        </button>
        <button
          className={`type-btn ${exerciseType === 'kanji' ? 'active' : ''}`}
          onClick={() => setExerciseType('kanji')}
        >
          Kanji
        </button>
      </div>

      <div className="score-board">
        <span>
          Điểm: {score}/{total} ({total > 0 ? Math.round((score / total) * 100) : 0}%)
        </span>
      </div>

      {currentExercise && (
        <div className="exercise-card">
          <div className="exercise-question">
            <h3>{currentExercise.question}</h3>
          </div>

          <div className="exercise-answer">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Nhập câu trả lời..."
              disabled={showResult}
              className="answer-input"
            />
          </div>

          {showResult && (
            <div
              className={`result-message ${isCorrect ? 'correct' : 'incorrect'}`}
            >
              {isCorrect ? (
                <div>
                  <span className="result-icon">✓</span>
                  <span>Đúng rồi!</span>
                </div>
              ) : (
                <div>
                  <span className="result-icon">✗</span>
                  <span>
                    Sai. Đáp án đúng: <strong>{currentExercise.answer}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="exercise-actions">
            {!showResult ? (
              <button onClick={handleSubmit} className="btn btn-submit">
                Kiểm tra
              </button>
            ) : (
              <button onClick={handleNext} className="btn btn-next">
                Câu tiếp theo →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

