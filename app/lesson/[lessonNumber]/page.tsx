import { redirect } from 'next/navigation'

export function generateStaticParams() {
  return Array.from({ length: 50 }, (_, i) => ({
    lessonNumber: String(i + 1),
  }))
}

export default function LessonPage({
  params,
}: {
  params: { lessonNumber: string }
}) {
  redirect(`/lesson/${params.lessonNumber}/vocabulary`)
}

