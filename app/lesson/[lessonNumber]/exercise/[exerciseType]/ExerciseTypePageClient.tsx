'use client'

import ExerciseClient from '../ExerciseClient'
import { routeToExerciseType } from '@/utils/exerciseRoute'
import { useI18n } from '@/i18n/context'

interface ExerciseTypePageClientProps {
  params: {
    lessonNumber: string
    exerciseType: string
  }
}

export default function ExerciseTypePageClient({ params }: ExerciseTypePageClientProps) {
  const { t } = useI18n()
  const lessonNumber = parseInt(params.lessonNumber, 10)
  const exerciseType = routeToExerciseType(params.exerciseType)

  if (!exerciseType) {
    return (
      <div>
        <h2>{t.exercise.invalidType}</h2>
        <p>{t.exercise.typeNotFound}: {params.exerciseType}</p>
      </div>
    )
  }

  return <ExerciseClient lessonNumber={lessonNumber} exerciseType={exerciseType} />
}
