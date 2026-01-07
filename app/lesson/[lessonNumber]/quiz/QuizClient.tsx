'use client';

import { Quiz, QuizQuestion } from '@/components/exercises';
import { getRandomQuizData } from '@/data/quizData';
import { useEffect, useState } from 'react';

interface QuizClientProps {
  lessonNumber: number;
}

export default function QuizClient({ lessonNumber }: QuizClientProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setQuestions(getRandomQuizData(lessonNumber));
  }, [lessonNumber]);

  if (!isMounted) {
    return (
      <div style={{ minHeight: '100vh', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Đang tải...</div>
      </div>
    );
  }

  return (
    <Quiz
      questions={questions}
      title={`Bài Tập Trắc Nghiệm - Bài ${lessonNumber}`}
      shuffleOptions={true}
    />
  );
}
