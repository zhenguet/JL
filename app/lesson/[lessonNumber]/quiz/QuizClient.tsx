'use client';

import { Quiz, QuizQuestion } from '@/components/Exercises';
import { getRandomQuizData } from '@/data/quizData';
import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/context';

interface QuizClientProps {
  lessonNumber: number;
}

export default function QuizClient({ lessonNumber }: QuizClientProps) {
  const { t } = useI18n();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setQuestions(getRandomQuizData(lessonNumber));
  }, [lessonNumber]);

  if (!isMounted) {
    return (
      <div style={{ minHeight: '100vh', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>{t.quiz.loading}</div>
      </div>
    );
  }

  return (
    <Quiz
      questions={questions}
      title={`${t.quiz.quizTitle} - ${t.common.lesson} ${lessonNumber}`}
      shuffleOptions={true}
    />
  );
}
