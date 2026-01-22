import GrammarClient from './GrammarClient'
import { generateLessonStaticParams } from '@/lib/utils/lessonParams'

export function generateStaticParams() {
  return generateLessonStaticParams()
}

interface PageProps {
  params: {
    lessonNumber: string
  }
}

export default function GrammarPage({ params }: PageProps) {
  const lessonNumber = parseInt(params.lessonNumber, 10)
  return <GrammarClient lessonNumber={lessonNumber} />
}

