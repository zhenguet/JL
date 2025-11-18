import FlashcardClient from './FlashcardClient'

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

export default function FlashcardPage({ params }: PageProps) {
  const lessonNumber = parseInt(params.lessonNumber, 10)
  return <FlashcardClient lessonNumber={lessonNumber} />
}

