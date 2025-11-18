import { vocabularyData } from '@/data/vocabulary'
import { VocabularyWord } from '@/types/vocabulary'
import './usage.css'

export function generateStaticParams() {
  return Array.from({ length: 50 }, (_, i) => ({
    lessonNumber: String(i + 1),
  }))
}

interface PageProps {
  params: {
    lessonNumber: string
  }
}

interface WordExplanation {
  title: string
  content: string[]
}

export default function UsagePage({ params }: PageProps) {
  const lessonNumber = parseInt(params.lessonNumber, 10)
  const vocabulary = vocabularyData[lessonNumber] || []

  const wordsWithExplanation = vocabulary
    .filter((word) => word.explanation !== undefined)
    .map((word) => {
      const title = word.explanation?.title || `${word.kanji || word.hiragana} (${word.hiragana}) - ${word.en} / ${word.vi}`
      return {
        ...word,
        explanation: {
          title,
          content: word.explanation!.content,
        },
      }
    })

  if (wordsWithExplanation.length === 0) {
    return (
      <div className="usage-container">
        <h2>Giải thích cách dùng</h2>
        <p className="empty-message">
          Chưa có giải thích cho từ vựng bài {lessonNumber}
        </p>
      </div>
    )
  }

  return (
    <div className="usage-container">
      <h2>Giải thích cách dùng - Bài {lessonNumber}</h2>
      <p className="intro-text">
        Dưới đây là cách sử dụng một số từ vựng quan trọng trong bài học:
      </p>

      <div className="explanations-list">
        {wordsWithExplanation.map((word, index) => (
          <div key={index} className="explanation-card">
            <div className="explanation-header">
              <div className="word-display">
                {word.kanji && (
                  <span className="word-kanji">{word.kanji}</span>
                )}
                <span className="word-hiragana">{word.hiragana}</span>
                <span className="word-meaning">({word.vi})</span>
              </div>
            </div>
            <div className="explanation-content">
              {word.explanation && (
                <>
                  <h3 className="explanation-title">
                    {word.explanation.title}
                  </h3>
                  <ul className="explanation-list">
                    {word.explanation.content.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

