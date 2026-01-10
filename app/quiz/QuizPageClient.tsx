'use client'

import { Quiz } from '@/components/Exercises'
import { sampleQuizData } from '@/data/quizData'
import { useI18n } from '@/i18n/context'
import { colors } from '@/lib/styles/colors'

export default function QuizPageClient() {
  const { t } = useI18n()
  return (
    <div style={{ minHeight: '100vh', padding: '20px', background: colors.bgLightest }}>
      <Quiz questions={sampleQuizData} title={t.quiz.quizTitle} />
    </div>
  )
}
