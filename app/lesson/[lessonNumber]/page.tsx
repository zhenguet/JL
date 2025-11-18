import { redirect } from 'next/navigation'

export default function LessonPage({
  params,
}: {
  params: { lessonNumber: string }
}) {
  redirect(`/lesson/${params.lessonNumber}/vocabulary`)
}

