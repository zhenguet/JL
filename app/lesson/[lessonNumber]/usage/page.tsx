import UsagePageClient from './UsagePageClient'
import { generateLessonStaticParams } from '@/lib/utils/lessonParams'

export function generateStaticParams() {
  return generateLessonStaticParams()
}

interface PageProps {
  params: {
    lessonNumber: string
  }
}

export default function UsagePage({ params }: PageProps) {
  const lessonNumber = parseInt(params.lessonNumber, 10)
  return <UsagePageClient lessonNumber={lessonNumber} />
}

