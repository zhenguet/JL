'use client'

import { Quiz } from '@/components/exercises'
import { sampleQuizData } from '@/data/quizData'
import { useI18n } from '@/i18n/context'

export default function QuizPageClient() {
  const { t } = useI18n()
  return (
    <div style={{ minHeight: '100vh', padding: '20px', background: '#f5f5f5' }}>
      <Quiz questions={sampleQuizData} title={t.quiz.quizTitle} />
    </div>
  )
}
