import { redirect } from 'next/navigation'
import { generateLessonStaticParams } from '@/lib/utils/lessonParams'

export function generateStaticParams() {
  return generateLessonStaticParams()
}

export default function LessonPage({
  params,
}: {
  params: { lessonNumber: string }
}) {
  redirect(`/lesson/${params.lessonNumber}/vocabulary`)
}

