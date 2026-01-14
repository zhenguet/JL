'use client'

import { Quiz } from '@/components/Exercises'
import { sampleQuizData } from '@/data/quizData'
import { useI18n } from '@/i18n/context'
import './QuizPageClient.css'

export default function QuizPageClient() {
  const { t } = useI18n()
  return (
    <div className="quiz-page-container">
      <Quiz questions={sampleQuizData} title={t.quiz.quizTitle} />
    </div>
  )
}
