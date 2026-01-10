'use client';

import { Quiz, QuizQuestion } from '@/components/Exercises';
import { getRandomQuizData } from '@/data/quizData';
import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/context';
import './QuizClient.css';

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
      <div className="quiz-loading-container">
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
