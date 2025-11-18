import { vocabularyData } from '@/data/vocabulary'
import './vocabulary.css'

interface PageProps {
  params: {
    lessonNumber: string
  }
}

export default function VocabularyPage({ params }: PageProps) {
  const lessonNumber = parseInt(params.lessonNumber, 10)
  const vocabulary = vocabularyData[lessonNumber] || []

  if (vocabulary.length === 0) {
    return (
      <div className="vocabulary-list">
        <h2>Từ vựng</h2>
        <p className="empty-message">
          Chưa có dữ liệu từ vựng cho bài {lessonNumber}
        </p>
      </div>
    )
  }

  const groupedByType = vocabulary.reduce(
    (acc, word) => {
      if (!acc[word.type]) {
        acc[word.type] = []
      }
      acc[word.type].push(word)
      return acc
    },
    {} as Record<string, typeof vocabulary>
  )

  const typeLabels: Record<string, string> = {
    noun: 'Danh từ',
    verb: 'Động từ',
    adjective: 'Tính từ',
    adverb: 'Trạng từ',
    other: 'Khác',
  }

  return (
    <div className="vocabulary-list">
      <h2>Từ vựng Bài {lessonNumber}</h2>
      <p className="vocab-count">Tổng cộng: {vocabulary.length} từ</p>

      {Object.entries(groupedByType).map(([type, words]) => (
        <div key={type} className="vocab-section">
          <h3 className="vocab-type-title">{typeLabels[type] || type}</h3>
          <table className="vocab-table">
            <thead>
              <tr>
                <th>Kanji</th>
                <th>Hiragana/Katakana</th>
                <th>Nghĩa</th>
              </tr>
            </thead>
            <tbody>
              {words.map((word, index) => (
                <tr key={index}>
                  <td className="kanji-cell">
                    {word.kanji || <span className="no-kanji">-</span>}
                  </td>
                  <td className="hiragana-cell">{word.hiragana}</td>
                  <td className="meaning-cell">{word.vi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}

