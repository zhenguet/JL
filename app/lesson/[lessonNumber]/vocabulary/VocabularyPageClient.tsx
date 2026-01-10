'use client'

import { vocabularyData } from '@/data/vocabulary'
import { EmptyMessage, PageTitle, VocabularyTable } from '@/components'
import { useI18n } from '@/i18n/context'
import './vocabulary.css'

interface VocabularyPageClientProps {
  lessonNumber: number
}

export default function VocabularyPageClient({ lessonNumber }: VocabularyPageClientProps) {
  const { t } = useI18n()
  const vocabulary = vocabularyData[lessonNumber] || []

  if (vocabulary.length === 0) {
    return (
      <div className="vocabulary-list">
        <PageTitle title={t.vocabulary.title} lessonNumber={lessonNumber} />
        <EmptyMessage message={`${t.vocabulary.noData} ${lessonNumber}`} />
      </div>
    )
  }

  return (
    <div className="vocabulary-list">
      <PageTitle
        title={t.vocabulary.title}
        lessonNumber={lessonNumber}
        count={vocabulary.length}
        countLabel={t.common.word}
      />
      <VocabularyTable words={vocabulary} />
    </div>
  )
}
