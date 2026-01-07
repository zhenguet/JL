const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const QUIZ_DIR = path.join(BASE_DIR, 'data', 'quiz');
const QUIZ_DATA_FILE = path.join(BASE_DIR, 'data', 'quizData.ts');

function getQuizFiles() {
  const files = fs.readdirSync(QUIZ_DIR);
  const quizFiles = files.filter((f) => f.startsWith('quiz') && f.endsWith('.json'));
  
  const imports = [];
  const quizSetsByLesson = {};
  
  // Group by lesson number
  const lessonMap = {};
  
  quizFiles.forEach((file) => {
    const match = file.match(/quiz(\d+)(_set(\d+))?\.json/);
    if (!match) return;
    
    const lessonNum = parseInt(match[1], 10);
    const setNum = match[2] ? parseInt(match[3], 10) : 1;
    
    if (!lessonMap[lessonNum]) {
      lessonMap[lessonNum] = {};
    }
    
    lessonMap[lessonNum][setNum] = file.replace('.json', '');
  });
  
  // Generate imports
  Object.keys(lessonMap)
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
    .forEach((lessonNum) => {
      const sets = lessonMap[lessonNum];
      const setNumbers = Object.keys(sets)
        .map(Number)
        .sort((a, b) => a - b);
      
      setNumbers.forEach((setNum) => {
        const varName = sets[setNum];
        imports.push(`import ${varName} from './quiz/${varName}.json';`);
      });
    });
  
  // Generate quizSetsByLesson
  Object.keys(lessonMap)
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
    .forEach((lessonNum) => {
      const sets = lessonMap[lessonNum];
      const setNumbers = Object.keys(sets)
        .map(Number)
        .sort((a, b) => a - b);
      
      if (setNumbers.length > 1) {
        quizSetsByLesson[lessonNum] = {};
        setNumbers.forEach((setNum) => {
          const varName = sets[setNum];
          quizSetsByLesson[lessonNum][setNum] = `${varName} as QuizQuestion[]`;
        });
      }
    });
  
  return { imports, quizSetsByLesson };
}

function generateQuizDataFile() {
  const { imports, quizSetsByLesson } = getQuizFiles();
  
  // Read existing file to get quizDataByLesson
  const existingContent = fs.readFileSync(QUIZ_DATA_FILE, 'utf-8');
  const quizDataByLessonMatch = existingContent.match(
    /const quizDataByLesson: Record<number, QuizQuestion\[\]> = \{([\s\S]*?)\};/
  );
  
  let newContent = `import { QuizQuestion } from '@/components/exercises/Quiz';\n`;
  
  // Add all imports
  imports.forEach((imp) => {
    newContent += `${imp}\n`;
  });
  
  newContent += `\n`;
  
  // Add quizDataByLesson (keep existing)
  if (quizDataByLessonMatch) {
    newContent += `const quizDataByLesson: Record<number, QuizQuestion[]> = {${quizDataByLessonMatch[1]}};\n\n`;
  } else {
    // Fallback: generate from imports
    const lessonNumbers = Object.keys(quizSetsByLesson)
      .map(Number)
      .sort((a, b) => a - b);
    
    newContent += `const quizDataByLesson: Record<number, QuizQuestion[]> = {\n`;
    lessonNumbers.forEach((lessonNum) => {
      const varName = `quiz${lessonNum}`;
      newContent += `  ${lessonNum}: ${varName} as QuizQuestion[],\n`;
    });
    newContent += `};\n\n`;
  }
  
  // Add quizSetsByLesson
  newContent += `const quizSetsByLesson: Record<number, Record<number, QuizQuestion[]>> = {\n`;
  
  Object.keys(quizSetsByLesson)
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
    .forEach((lessonNum) => {
      newContent += `  ${lessonNum}: {\n`;
      const sets = quizSetsByLesson[lessonNum];
      Object.keys(sets)
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
        .forEach((setNum) => {
          newContent += `    ${setNum}: ${sets[setNum]},\n`;
        });
      newContent += `  },\n`;
    });
  
  newContent += `};\n\n`;
  
  // Add functions (keep existing)
  const functionsMatch = existingContent.match(
    /export function getQuizData[\s\S]*?export const sampleQuizData[\s\S]*?/
  );
  if (functionsMatch) {
    newContent += functionsMatch[0];
  } else {
    newContent += `export function getQuizData(lessonNumber: number, setNumber?: number): QuizQuestion[] {
  if (setNumber && quizSetsByLesson[lessonNumber]?.[setNumber]) {
    return quizSetsByLesson[lessonNumber][setNumber];
  }
  return quizDataByLesson[lessonNumber] || quizDataByLesson[1] || [];
}

export function getRandomQuizData(lessonNumber: number): QuizQuestion[] {
  const availableSets = getAvailableQuizSets(lessonNumber);
  if (availableSets.length === 0) {
    return quizDataByLesson[lessonNumber] || quizDataByLesson[1] || [];
  }
  const randomSetNumber = availableSets[Math.floor(Math.random() * availableSets.length)];
  return getQuizData(lessonNumber, randomSetNumber);
}

export function getAvailableQuizSets(lessonNumber: number): number[] {
  if (quizSetsByLesson[lessonNumber]) {
    return Object.keys(quizSetsByLesson[lessonNumber]).map(Number).sort((a, b) => a - b);
  }
  return quizDataByLesson[lessonNumber] ? [1] : [];
}

export const sampleQuizData: QuizQuestion[] = quizDataByLesson[1] || [];
`;
  }
  
  fs.writeFileSync(QUIZ_DATA_FILE, newContent, 'utf-8');
  console.log(`✓ Updated ${QUIZ_DATA_FILE}`);
  console.log(`  - ${imports.length} imports`);
  console.log(`  - ${Object.keys(quizSetsByLesson).length} lessons with multiple sets`);
}

generateQuizDataFile();
