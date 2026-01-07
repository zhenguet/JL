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
import quiz15 from './quiz/quiz15.json';
import quiz16 from './quiz/quiz16.json';
import quiz17 from './quiz/quiz17.json';
import quiz18 from './quiz/quiz18.json';
import quiz19 from './quiz/quiz19.json';
import quiz20 from './quiz/quiz20.json';
import quiz21 from './quiz/quiz21.json';
import quiz22 from './quiz/quiz22.json';
import quiz23 from './quiz/quiz23.json';
import quiz24 from './quiz/quiz24.json';
import quiz25 from './quiz/quiz25.json';
import quiz26 from './quiz/quiz26.json';
import quiz27 from './quiz/quiz27.json';
import quiz28 from './quiz/quiz28.json';
import quiz29 from './quiz/quiz29.json';
import quiz30 from './quiz/quiz30.json';
import quiz31 from './quiz/quiz31.json';
import quiz32 from './quiz/quiz32.json';
import quiz33 from './quiz/quiz33.json';
import quiz34 from './quiz/quiz34.json';
import quiz35 from './quiz/quiz35.json';
import quiz36 from './quiz/quiz36.json';
import quiz37 from './quiz/quiz37.json';
import quiz38 from './quiz/quiz38.json';
import quiz39 from './quiz/quiz39.json';
import quiz40 from './quiz/quiz40.json';
import quiz41 from './quiz/quiz41.json';
import quiz42 from './quiz/quiz42.json';
import quiz43 from './quiz/quiz43.json';
import quiz44 from './quiz/quiz44.json';
import quiz45 from './quiz/quiz45.json';
import quiz46 from './quiz/quiz46.json';
import quiz47 from './quiz/quiz47.json';
import quiz48 from './quiz/quiz48.json';
import quiz49 from './quiz/quiz49.json';
import quiz50 from './quiz/quiz50.json';

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
  15: quiz15 as QuizQuestion[],
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
  26: quiz26 as QuizQuestion[],
  27: quiz27 as QuizQuestion[],
  28: quiz28 as QuizQuestion[],
  29: quiz29 as QuizQuestion[],
  30: quiz30 as QuizQuestion[],
  31: quiz31 as QuizQuestion[],
  32: quiz32 as QuizQuestion[],
  33: quiz33 as QuizQuestion[],
  34: quiz34 as QuizQuestion[],
  35: quiz35 as QuizQuestion[],
  36: quiz36 as QuizQuestion[],
  37: quiz37 as QuizQuestion[],
  38: quiz38 as QuizQuestion[],
  39: quiz39 as QuizQuestion[],
  40: quiz40 as QuizQuestion[],
  41: quiz41 as QuizQuestion[],
  42: quiz42 as QuizQuestion[],
  43: quiz43 as QuizQuestion[],
  44: quiz44 as QuizQuestion[],
  45: quiz45 as QuizQuestion[],
  46: quiz46 as QuizQuestion[],
  47: quiz47 as QuizQuestion[],
  48: quiz48 as QuizQuestion[],
  49: quiz49 as QuizQuestion[],
  50: quiz50 as QuizQuestion[],
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getQuizData(lessonNumber: number): QuizQuestion[] {
  return quizDataByLesson[lessonNumber] || quizDataByLesson[1] || [];
}

/**
 * Get random quiz questions with balanced difficulty distribution
 * 
 * Default distribution for 25 questions:
 * - Level 1 (Easiest): 5 questions (20%)
 * - Level 2 (Easy): 7 questions (28%)
 * - Level 3 (Medium): 8 questions (32%)
 * - Level 4 (Hard): 4 questions (16%)
 * - Level 5 (Very Hard): 1 question (4%)
 * 
 * If there are not enough questions for a difficulty level, questions from other levels will be used to ensure the total count
 */
export function getRandomQuizData(
  lessonNumber: number, 
  numQuestions: number = 25
): QuizQuestion[] {
  const allQuestions = getQuizData(lessonNumber);
  if (allQuestions.length === 0) {
    return [];
  }
  
  // Classify questions by difficulty level
  const questionsByDifficulty: Record<number, QuizQuestion[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: []
  };
  
  allQuestions.forEach((q) => {
    const difficulty = q.difficulty || 3; // Default to 3 if not set
    if (difficulty >= 1 && difficulty <= 5) {
      questionsByDifficulty[difficulty].push(q);
    }
  });
  
  // Calculate target count for each difficulty level (ratios as above)
  const getTargetCount = (total: number, ratio: number) => {
    return Math.max(1, Math.floor(total * ratio));
  };
  
  const targetCounts = {
    1: getTargetCount(numQuestions, 0.20), // 20%
    2: getTargetCount(numQuestions, 0.28), // 28%
    3: getTargetCount(numQuestions, 0.32), // 32%
    4: getTargetCount(numQuestions, 0.16), // 16%
    5: getTargetCount(numQuestions, 0.04)  // 4%
  };
  
  const selectedQuestions: QuizQuestion[] = [];
  
  // Select questions from each difficulty level
  const levels: (1 | 2 | 3 | 4 | 5)[] = [1, 2, 3, 4, 5];
  levels.forEach((level) => {
    const available = shuffleArray([...questionsByDifficulty[level]]);
    const count = Math.min(targetCounts[level], available.length);
    selectedQuestions.push(...available.slice(0, count));
  });
  
  // If not enough questions, fill from other difficulty levels
  if (selectedQuestions.length < numQuestions) {
    const remaining = numQuestions - selectedQuestions.length;
    const allRemaining: QuizQuestion[] = [];
    
    levels.forEach((level) => {
      const available = shuffleArray([...questionsByDifficulty[level]]);
      const alreadySelected = selectedQuestions.filter(q => 
        questionsByDifficulty[level].includes(q)
      );
      const remainingFromLevel = available.filter(q => !alreadySelected.includes(q));
      allRemaining.push(...remainingFromLevel);
    });
    
    const shuffledRemaining = shuffleArray(allRemaining);
    selectedQuestions.push(...shuffledRemaining.slice(0, remaining));
  }
  
  // Shuffle and limit to target count
  const finalQuestions = shuffleArray(selectedQuestions);
  return finalQuestions.slice(0, Math.min(numQuestions, finalQuestions.length));
}

export const sampleQuizData: QuizQuestion[] = quizDataByLesson[1] || [];
