import FlashcardClient from './FlashcardClient'
import { generateLessonStaticParams } from '@/lib/utils/lessonParams'

export function generateStaticParams() {
  return generateLessonStaticParams()
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

