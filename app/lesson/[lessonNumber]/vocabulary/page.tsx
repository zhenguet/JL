import { vocabularyData } from '@/data/vocabulary'
import { EmptyMessage, PageTitle, VocabularyTable } from '@/components'
import './vocabulary.css'

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

export default function VocabularyPage({ params }: PageProps) {
  const lessonNumber = parseInt(params.lessonNumber, 10)
  const vocabulary = vocabularyData[lessonNumber] || []

  if (vocabulary.length === 0) {
    return (
      <div className="vocabulary-list">
        <PageTitle title="Từ vựng" lessonNumber={lessonNumber} />
        <EmptyMessage message={`Chưa có dữ liệu từ vựng cho bài ${lessonNumber}`} />
      </div>
    )
  }

  return (
    <div className="vocabulary-list">
      <PageTitle
        title="Từ vựng"
        lessonNumber={lessonNumber}
        count={vocabulary.length}
        countLabel="từ"
      />
      <VocabularyTable words={vocabulary} />
    </div>
  )
}

