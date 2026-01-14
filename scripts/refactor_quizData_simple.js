const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const QUIZ_DIR = path.join(BASE_DIR, 'data', 'quiz');
const QUIZ_DATA_FILE = path.join(BASE_DIR, 'data', 'quizData.ts');

function getQuizFiles() {
  const files = fs.readdirSync(QUIZ_DIR);
  const quizFiles = files.filter((f) => f.match(/^quiz\d+\.json$/));
  
  return quizFiles.sort((a, b) => {
    const numA = parseInt(a.match(/quiz(\d+)\.json/)[1], 10);
    const numB = parseInt(b.match(/quiz(\d+)\.json/)[1], 10);
    return numA - numB;
  });
}

function generateSimpleQuizDataFile() {
  const quizFiles = getQuizFiles();
  
  // Generate imports
  const imports = [];
  const quizDataByLessonEntries = [];
  
  quizFiles.forEach((file) => {
    const match = file.match(/quiz(\d+)\.json/);
    if (!match) return;
    
    const lessonNum = parseInt(match[1], 10);
    const varName = file.replace('.json', '');
    
    imports.push(`import ${varName} from './quiz/${varName}.json';`);
    quizDataByLessonEntries.push(`  ${varName},`);
  });

  const content = `import { QuizQuestion } from '@/types/quiz';

${imports.join('\n')}

const quizzes: QuizQuestion[][] = [
${quizDataByLessonEntries.join('\n')}
] as QuizQuestion[][];

const quizDataByLesson: Record<number, QuizQuestion[]> = quizzes.reduce(
  (acc, quiz, index) => {
    acc[index + 1] = quiz;
    return acc;
  },
  {} as Record<number, QuizQuestion[]>
);

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

export function getRandomQuizData(lessonNumber: number, numQuestions: number = 25): QuizQuestion[] {
  const allQuestions = getQuizData(lessonNumber);
  if (allQuestions.length === 0) {
    return [];
  }
  
  const shuffled = shuffleArray([...allQuestions]);
  return shuffled.slice(0, Math.min(numQuestions, shuffled.length));
}

export const sampleQuizData: QuizQuestion[] = quizDataByLesson[1] || [];
`;
  
  fs.writeFileSync(QUIZ_DATA_FILE, content, 'utf-8');
  console.log(`✓ Refactored ${QUIZ_DATA_FILE}`);
  console.log(`  - ${imports.length} imports`);
  console.log(`  - Simplified structure (no sets)`);
}

generateSimpleQuizDataFile();
