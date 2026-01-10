import VocabularyPageClient from './VocabularyPageClient'

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
  return <VocabularyPageClient lessonNumber={lessonNumber} />
}

