import { grammarData } from '@/data/grammar'
import { GrammarPoint } from '@/types/grammar'
import './grammar.css'

interface PageProps {
  params: {
    lessonNumber: string
  }
}

export default function GrammarPage({ params }: PageProps) {
  const lessonNumber = parseInt(params.lessonNumber, 10)
  const grammar = grammarData[lessonNumber] || []

  if (grammar.length === 0) {
    return (
      <div className="grammar-container">
        <h2>Ngữ pháp - Bài {lessonNumber}</h2>
        <p className="empty-message">
          Chưa có dữ liệu ngữ pháp cho bài {lessonNumber}
        </p>
      </div>
    )
  }

  return (
    <div className="grammar-container">
      <h2>Ngữ pháp - Bài {lessonNumber}</h2>
      <p className="grammar-intro">
        Dưới đây là các điểm ngữ pháp quan trọng trong bài học:
      </p>

      <div className="grammar-list">
        {grammar.map((point, index) => (
          <div key={point.id || index} className="grammar-card">
            <div className="grammar-header">
              <h3 className="grammar-title">{point.title}</h3>
            </div>
            <div className="grammar-content">
              <p className="grammar-description">{point.description}</p>
              <div className="grammar-structure">
                <h4>Cấu trúc:</h4>
                <code className="structure-code">{point.structure}</code>
              </div>
              <div className="grammar-examples">
                <h4>Ví dụ:</h4>
                <ul className="example-list">
                  {point.examples.map((example, idx) => (
                    <li key={idx} className="example-item">
                      <div className="example-japanese">{example.japanese}</div>
                      <div className="example-romaji">{example.romaji}</div>
                      <div className="example-vietnamese">{example.vietnamese}</div>
                    </li>
                  ))}
                </ul>
              </div>
              {point.notes && point.notes.length > 0 && (
                <div className="grammar-notes">
                  <h4>Lưu ý:</h4>
                  <ul className="notes-list">
                    {point.notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

