const fs = require('fs');
const path = require('path');

const QUIZ_FILE = path.join(__dirname, '..', 'data', 'quiz', 'quiz4.json');
const ANALYSIS_FILE = path.join(__dirname, '..', 'quiz4_analysis_result.json');

const quizData = JSON.parse(fs.readFileSync(QUIZ_FILE, 'utf8').replace(/^\uFEFF/, ''));
const analysisData = JSON.parse(fs.readFileSync(ANALYSIS_FILE, 'utf8').replace(/^\uFEFF/, ''));

const analysisMap = new Map();
analysisData.details.forEach(detail => {
  analysisMap.set(detail.id, detail);
});

const fixedQuizzes = [];
let removedCount = 0;
let fixedCount = 0;

quizData.forEach(quiz => {
  const analysis = analysisMap.get(quiz.id);
  
  if (!analysis) {
    fixedQuizzes.push(quiz);
    return;
  }
  
  if (analysis.errors.includes('lesson_mismatch')) {
    removedCount++;
    return;
  }
  
  if (analysis.status === 'PASS') {
    fixedQuizzes.push(quiz);
    return;
  }
  
  if (analysis.suggested_fix) {
    const fixed = {
      ...quiz,
      question: analysis.suggested_fix.question,
      options: analysis.suggested_fix.options,
      correctAnswer: analysis.suggested_fix.correctAnswer
    };
    fixedQuizzes.push(fixed);
    fixedCount++;
  } else {
    fixedQuizzes.push(quiz);
  }
});

fs.writeFileSync(QUIZ_FILE, JSON.stringify(fixedQuizzes, null, 2), 'utf8');

console.log(`Đã xử lý xong quiz4.json:`);
console.log(`- Đã xóa: ${removedCount} quiz (lesson_mismatch)`);
console.log(`- Đã sửa: ${fixedCount} quiz`);
console.log(`- Giữ lại: ${fixedQuizzes.length} quiz`);
console.log(`- Tổng ban đầu: ${quizData.length} quiz`);
