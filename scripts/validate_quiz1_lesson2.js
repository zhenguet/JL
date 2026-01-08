const fs = require('fs');
const path = require('path');

const quizPath = path.join(__dirname, '..', 'data', 'quiz', 'quiz1.json');
const lesson1Path = path.join(__dirname, '..', 'data', 'lesson', 'lesson1.json');
const lesson2Path = path.join(__dirname, '..', 'data', 'lesson', 'lesson2.json');

const quiz = JSON.parse(fs.readFileSync(quizPath, 'utf8'));
const lesson1 = JSON.parse(fs.readFileSync(lesson1Path, 'utf8'));
const lesson2 = JSON.parse(fs.readFileSync(lesson2Path, 'utf8'));

const lesson1Vocab = new Set();
const lesson2Vocab = new Set();

lesson1.forEach(item => {
  if (item.hiragana) lesson1Vocab.add(item.hiragana);
  if (item.kanji) lesson1Vocab.add(item.kanji);
});

lesson2.forEach(item => {
  if (item.hiragana) lesson2Vocab.add(item.hiragana);
  if (item.kanji) lesson2Vocab.add(item.kanji);
});

const allowedVocab = new Set([...lesson1Vocab, ...lesson2Vocab]);

function extractJapaneseWords(text) {
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
  return text.match(japaneseRegex) || [];
}

function checkLessonMatch(text) {
  const words = extractJapaneseWords(text);
  for (const word of words) {
    if (!allowedVocab.has(word)) {
      return { valid: false, word };
    }
  }
  return { valid: true };
}

const results = {
  summary: {
    total: quiz.length,
    technical_errors: 0,
    answer_errors: 0,
    lesson_mismatches: 0
  },
  details: []
};

const seenIds = new Set();
const seenQuestions = new Set();

quiz.forEach((item, index) => {
  const detail = {
    id: item.id,
    status: 'PASS',
    errors: [],
    explanation: '',
    suggested_fix: null
  };

  let hasError = false;

  if (!item.id || seenIds.has(item.id)) {
    detail.errors.push('technical_error');
    detail.explanation += 'ID trùng hoặc không hợp lệ. ';
    hasError = true;
  }
  seenIds.add(item.id);

  if (!item.question || item.question.trim() === '') {
    detail.errors.push('technical_error');
    detail.explanation += 'Question rỗng. ';
    hasError = true;
  }

  if (!Array.isArray(item.options) || item.options.length < 2) {
    detail.errors.push('technical_error');
    detail.explanation += 'Options không phải mảng hoặc có ít hơn 2 phần tử. ';
    hasError = true;
  }

  const uniqueOptions = new Set(item.options);
  if (item.options && item.options.length !== uniqueOptions.size) {
    detail.errors.push('technical_error');
    detail.explanation += 'Options có phần tử trùng. ';
    hasError = true;
  }

  if (typeof item.correctAnswer !== 'number' || 
      item.correctAnswer < 0 || 
      item.correctAnswer >= (item.options?.length || 0)) {
    detail.errors.push('technical_error');
    detail.explanation += 'correctAnswer không hợp lệ. ';
    hasError = true;
  }

  if (typeof item.difficulty !== 'number' || item.difficulty <= 0) {
    detail.errors.push('technical_error');
    detail.explanation += 'difficulty không phải số nguyên dương. ';
    hasError = true;
  }

  const questionKey = item.question?.replace(/<[^>]*>/g, '').trim();
  if (questionKey && seenQuestions.has(questionKey)) {
    detail.errors.push('technical_error');
    detail.explanation += 'Câu hỏi trùng với quiz khác. ';
    hasError = true;
  }
  if (questionKey) seenQuestions.add(questionKey);

  if (hasError) {
    detail.status = 'FAIL';
    results.summary.technical_errors++;
  }

  const lessonCheck = checkLessonMatch(item.question || '');
  if (!lessonCheck.valid) {
    detail.errors.push('lesson_mismatch');
    detail.explanation += `Từ "${lessonCheck.word}" không thuộc bài 1 hoặc 2. `;
    detail.status = 'FAIL';
    hasError = true;
    results.summary.lesson_mismatches++;
  }

  if (item.options) {
    item.options.forEach(opt => {
      const optCheck = checkLessonMatch(opt);
      if (!optCheck.valid) {
        detail.errors.push('lesson_mismatch');
        detail.explanation += `Option chứa từ "${optCheck.word}" không thuộc bài 1 hoặc 2. `;
        detail.status = 'FAIL';
        hasError = true;
        if (!detail.errors.includes('lesson_mismatch')) {
          results.summary.lesson_mismatches++;
        }
      }
    });
  }

  if (hasError) {
    detail.status = 'FAIL';
  }

  results.details.push(detail);
});

console.log(JSON.stringify(results, null, 2));
