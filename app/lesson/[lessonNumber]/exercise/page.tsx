import ExerciseClient from './ExerciseClient'

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

export default function ExercisePage({ params }: PageProps) {
  const lessonNumber = parseInt(params.lessonNumber, 10)
  return <ExerciseClient lessonNumber={lessonNumber} />
}

