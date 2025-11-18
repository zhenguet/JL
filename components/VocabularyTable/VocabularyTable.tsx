import { VocabularyWord } from '@/types/vocabulary'
import './VocabularyTable.css'

interface VocabularyTableProps {
  words: VocabularyWord[]
  showKanji?: boolean
}

const typeLabels: Record<string, string> = {
  noun: 'Danh từ',
  verb: 'Động từ',
  adjective: 'Tính từ',
  adverb: 'Trạng từ',
  other: 'Khác',
}

export default function VocabularyTable({ words, showKanji = true }: VocabularyTableProps) {
  if (words.length === 0) {
    return null
  }

  const groupedByType = words.reduce(
    (acc, word) => {
      if (!acc[word.type]) {
        acc[word.type] = []
      }
      acc[word.type].push(word)
      return acc
    },
    {} as Record<string, VocabularyWord[]>
  )

  return (
    <>
      {Object.entries(groupedByType).map(([type, typeWords]) => (
        <div key={type} className="vocab-section">
          <h3 className="vocab-type-title">{typeLabels[type] || type}</h3>
          <div className="vocab-table-wrapper">
            <table className="vocab-table">
              <thead>
                <tr>
                  <th>Kanji</th>
                  <th>Hiragana/Katakana</th>
                  <th>Nghĩa</th>
                </tr>
              </thead>
              <tbody>
                {typeWords.map((word, index) => (
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
        </div>
      ))}
    </>
  )
}

