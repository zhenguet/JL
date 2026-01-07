import { QuizQuestion } from '@/components/exercises/Quiz';
import quiz1 from './quiz/quiz1.json';
import quiz2 from './quiz/quiz2.json';
import quiz3 from './quiz/quiz3.json';
import quiz4 from './quiz/quiz4.json';
import quiz5 from './quiz/quiz5.json';
import quiz6 from './quiz/quiz6.json';
import quiz7 from './quiz/quiz7.json';
import quiz8 from './quiz/quiz8.json';
import quiz9 from './quiz/quiz9.json';
import quiz10 from './quiz/quiz10.json';
import quiz11 from './quiz/quiz11.json';
import quiz12 from './quiz/quiz12.json';
import quiz13 from './quiz/quiz13.json';
import quiz14 from './quiz/quiz14.json';
import quiz16 from './quiz/quiz16.json';
import quiz19 from './quiz/quiz19.json';
import quiz17 from './quiz/quiz17.json';
import quiz18 from './quiz/quiz18.json';
import quiz20 from './quiz/quiz20.json';
import quiz21 from './quiz/quiz21.json';
import quiz22 from './quiz/quiz22.json';
import quiz23 from './quiz/quiz23.json';
import quiz24 from './quiz/quiz24.json';
import quiz25 from './quiz/quiz25.json';

const quizDataByLesson: Record<number, QuizQuestion[]> = {
  1: quiz1 as QuizQuestion[],
  2: quiz2 as QuizQuestion[],
  3: quiz3 as QuizQuestion[],
  4: quiz4 as QuizQuestion[],
  5: quiz5 as QuizQuestion[],
  6: quiz6 as QuizQuestion[],
  7: quiz7 as QuizQuestion[],
  8: quiz8 as QuizQuestion[],
  9: quiz9 as QuizQuestion[],
  10: quiz10 as QuizQuestion[],
  11: quiz11 as QuizQuestion[],
  12: quiz12 as QuizQuestion[],
  13: quiz13 as QuizQuestion[],
  14: quiz14 as QuizQuestion[],
  16: quiz16 as QuizQuestion[],
  17: quiz17 as QuizQuestion[],
  18: quiz18 as QuizQuestion[],
  19: quiz19 as QuizQuestion[],
  20: quiz20 as QuizQuestion[],
  21: quiz21 as QuizQuestion[],
  22: quiz22 as QuizQuestion[],
  23: quiz23 as QuizQuestion[],
  24: quiz24 as QuizQuestion[],
  25: quiz25 as QuizQuestion[],
};

export function getQuizData(lessonNumber: number): QuizQuestion[] {
  return quizDataByLesson[lessonNumber] || quizDataByLesson[1] || [];
}

export const sampleQuizData: QuizQuestion[] = quizDataByLesson[1] || [];
