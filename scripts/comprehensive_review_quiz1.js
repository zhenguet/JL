const fs = require('fs');
const path = require('path');

const quizPath = path.join(__dirname, '..', 'data', 'quiz', 'quiz1.json');
const lesson1Path = path.join(__dirname, '..', 'data', 'lesson', 'lesson1.json');
const lesson2Path = path.join(__dirname, '..', 'data', 'lesson', 'lesson2.json');

const quiz = JSON.parse(fs.readFileSync(quizPath, 'utf8'));
const lesson1 = JSON.parse(fs.readFileSync(lesson1Path, 'utf8'));
const lesson2 = JSON.parse(fs.readFileSync(lesson2Path, 'utf8'));

const vocabMap = new Map();

[...lesson1, ...lesson2].forEach(item => {
  if (item.hiragana) {
    vocabMap.set(item.hiragana, { vi: item.vi, en: item.en, lesson: lesson1.includes(item) ? 1 : 2 });
  }
  if (item.kanji && item.kanji !== item.hiragana) {
    vocabMap.set(item.kanji, { vi: item.vi, en: item.en, lesson: lesson1.includes(item) ? 1 : 2 });
  }
});

function extractJapaneseWords(text) {
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
  return text.match(japaneseRegex) || [];
}

function findVocabInfo(word) {
  return vocabMap.get(word);
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

quiz.forEach((item) => {
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

  const questionWords = extractJapaneseWords(item.question || '');
  const invalidWords = [];
  questionWords.forEach(word => {
    if (!vocabMap.has(word)) {
      invalidWords.push(word);
    }
  });

  if (item.options) {
    item.options.forEach(opt => {
      const optWords = extractJapaneseWords(opt);
      optWords.forEach(word => {
        if (!vocabMap.has(word) && !invalidWords.includes(word)) {
          invalidWords.push(word);
        }
      });
    });
  }

  if (invalidWords.length > 0) {
    detail.errors.push('lesson_mismatch');
    detail.explanation += `Từ không thuộc bài 1-2: ${invalidWords.join(', ')}. `;
    detail.status = 'FAIL';
    hasError = true;
    results.summary.lesson_mismatches++;
  }

  if (item.question && item.options && typeof item.correctAnswer === 'number') {
    const questionWords = extractJapaneseWords(item.question);
    const correctAnswerText = item.options[item.correctAnswer];
    
    if (questionWords.length > 0) {
      const mainWord = questionWords[0];
      const vocabInfo = findVocabInfo(mainWord);
      
      if (vocabInfo) {
        const correctAnswerWords = extractJapaneseWords(correctAnswerText);
        const isAnswerCorrect = correctAnswerText.toLowerCase().includes(vocabInfo.vi.toLowerCase()) ||
                                vocabInfo.vi.toLowerCase().includes(correctAnswerText.toLowerCase());
        
        if (!isAnswerCorrect && correctAnswerWords.length === 0) {
          detail.errors.push('answer_error');
          detail.explanation += `Đáp án "${correctAnswerText}" không khớp với nghĩa "${vocabInfo.vi}" của từ "${mainWord}". `;
          detail.status = 'FAIL';
          hasError = true;
          results.summary.answer_errors++;
        }
      }
    }
  }

  if (hasError && detail.status === 'FAIL') {
    detail.status = 'FAIL';
  } else if (!hasError) {
    detail.status = 'PASS';
  }

  results.details.push(detail);
});

console.log(JSON.stringify(results, null, 2));
