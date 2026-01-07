const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const QUIZ_DIR = path.join(BASE_DIR, 'data', 'quiz');

function loadJson(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }
  return JSON.parse(content);
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function mergeQuizSetsForLesson(lessonNumber) {
  const allQuestions = [];
  const seenQuestions = new Set();

  // Load base quiz file
  const baseFile = path.join(QUIZ_DIR, `quiz${lessonNumber}.json`);
  if (fs.existsSync(baseFile)) {
    const baseQuiz = loadJson(baseFile);
    baseQuiz.forEach((q) => {
      const key = `${q.question}_${q.options.join('_')}`;
      if (!seenQuestions.has(key)) {
        seenQuestions.add(key);
        allQuestions.push(q);
      }
    });
  }

  // Load all set files
  for (let setNum = 2; setNum <= 10; setNum++) {
    const setFile = path.join(QUIZ_DIR, `quiz${lessonNumber}_set${setNum}.json`);
    if (fs.existsSync(setFile)) {
      const setQuiz = loadJson(setFile);
      setQuiz.forEach((q) => {
        const key = `${q.question}_${q.options.join('_')}`;
        if (!seenQuestions.has(key)) {
          seenQuestions.add(key);
          allQuestions.push(q);
        }
      });
    }
  }

  // Remove duplicates based on question text and options
  const uniqueQuestions = [];
  const questionMap = new Map();

  allQuestions.forEach((q) => {
    const questionText = q.question.replace(/<[^>]+>/g, '').trim();
    const optionsKey = q.options.sort().join('|');
    const mapKey = `${questionText}_${optionsKey}`;

    if (!questionMap.has(mapKey)) {
      questionMap.set(mapKey, true);
      uniqueQuestions.push(q);
    }
  });

  // Re-assign IDs
  const shuffled = shuffleArray(uniqueQuestions);
  shuffled.forEach((q, index) => {
    q.id = index + 1;
  });

  return shuffled;
}

function main() {
  console.log('Merging quiz sets into single files per lesson...\n');

  let totalMerged = 0;
  let totalQuestions = 0;

  for (let lessonNum = 1; lessonNum <= 50; lessonNum++) {
    const mergedQuestions = mergeQuizSetsForLesson(lessonNum);
    
    if (mergedQuestions.length > 0) {
      const outputFile = path.join(QUIZ_DIR, `quiz${lessonNum}.json`);
      saveJson(outputFile, mergedQuestions);
      
      totalMerged++;
      totalQuestions += mergedQuestions.length;
      
      console.log(`✓ Lesson ${lessonNum}: ${mergedQuestions.length} questions merged`);
    } else {
      console.log(`⚠ Lesson ${lessonNum}: No questions found`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('MERGE SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total lessons processed: ${totalMerged}`);
  console.log(`Total questions: ${totalQuestions}`);
  console.log(`Average questions per lesson: ${(totalQuestions / totalMerged).toFixed(1)}`);
  console.log('='.repeat(60));
  console.log('\n✅ Merge completed!');
  console.log('\n📝 Next steps:');
  console.log('  1. Review the merged quiz files');
  console.log('  2. Run: node scripts/refactor_quizData_simple.js');
  console.log('  3. Optionally delete old _set files');
}

main();
