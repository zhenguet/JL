const fs = require('fs');
const path = require('path');

const quizPath = path.join(__dirname, '..', 'data', 'quiz', 'quiz5.json');
const lesson5Path = path.join(__dirname, '..', 'data', 'lesson', 'lesson5.json');
const grammar5Path = path.join(__dirname, '..', 'data', 'grammar', 'grammar5.json');

const quiz = JSON.parse(fs.readFileSync(quizPath, 'utf8').replace(/^\uFEFF/, ''));
const lesson5 = JSON.parse(fs.readFileSync(lesson5Path, 'utf8').replace(/^\uFEFF/, ''));
const grammar5 = JSON.parse(fs.readFileSync(grammar5Path, 'utf8').replace(/^\uFEFF/, ''));

const vocabByHiragana = new Map();
const vocabByKanji = new Map();

lesson5.forEach(item => {
  const vocab = {
    hiragana: item.hiragana,
    kanji: item.kanji,
    vi: item.vi,
    en: item.en
  };

  if (item.hiragana) {
    vocabByHiragana.set(item.hiragana, vocab);
  }
  if (item.kanji && item.kanji !== item.hiragana) {
    vocabByKanji.set(item.kanji, vocab);
  }
});

function extractJapaneseWords(text) {
  if (!text) return [];
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
  return text.match(japaneseRegex) || [];
}

function findVocabInfo(word) {
  return vocabByHiragana.get(word) || vocabByKanji.get(word);
}

function checkLessonMatch(text) {
  const words = extractJapaneseWords(text);
  const invalidWords = [];
  for (const word of words) {
    if (!findVocabInfo(word) && !['の', 'は', 'が', 'を', 'に', 'へ', 'と', 'から', 'まで', 'も', 'か', 'です', 'ですか', 'ではありません', 'じゃありません', 'で', 'どこ', 'いつ', 'だれ', 'なに', 'なん', 'よ', '×', 'Ｘ'].includes(word)) {
      invalidWords.push(word);
    }
  }
  return { valid: invalidWords.length === 0, invalidWords };
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
const seenQuestions = new Map();

quiz.forEach((item) => {
  const detail = {
    id: item.id,
    status: 'PASS',
    errors: [],
    explanation: '',
    suggested_fix: null
  };

  let hasError = false;

  if (typeof item.id !== 'number' || seenIds.has(item.id)) {
    detail.errors.push('technical_error');
    detail.explanation += 'ID trùng hoặc không hợp lệ. ';
    hasError = true;
  }
  seenIds.add(item.id);

  if (!item.question || typeof item.question !== 'string' || item.question.trim() === '') {
    detail.errors.push('technical_error');
    detail.explanation += 'Question rỗng hoặc không hợp lệ. ';
    hasError = true;
  }

  if (!Array.isArray(item.options) || item.options.length < 2) {
    detail.errors.push('technical_error');
    detail.explanation += 'Options không phải mảng hoặc có ít hơn 2 phần tử. ';
    hasError = true;
  }

  if (item.options) {
    const uniqueOptions = new Set(item.options.map(opt => opt.trim().toLowerCase()));
    if (item.options.length !== uniqueOptions.size) {
      detail.errors.push('technical_error');
      detail.explanation += 'Options có phần tử trùng. ';
      hasError = true;
    }
  }

  if (typeof item.correctAnswer !== 'number' ||
      item.correctAnswer < 0 ||
      item.correctAnswer >= (item.options?.length || 0)) {
    detail.errors.push('technical_error');
    detail.explanation += 'correctAnswer không hợp lệ. ';
    hasError = true;
  }

  if (typeof item.difficulty !== 'number' || item.difficulty <= 0 || !Number.isInteger(item.difficulty)) {
    detail.errors.push('technical_error');
    detail.explanation += 'difficulty không phải số nguyên dương. ';
    hasError = true;
  }

  const questionKey = item.question?.replace(/<[^>]*>/g, '').replace(/<ruby>.*?<\/ruby>/g, '').trim().toLowerCase();
  if (questionKey) {
    const existingId = seenQuestions.get(questionKey);
    if (existingId && existingId !== item.id) {
      detail.errors.push('technical_error');
      detail.explanation += `Câu hỏi trùng với quiz ID ${existingId}. `;
      hasError = true;
    } else if (!existingId) {
      seenQuestions.set(questionKey, item.id);
    }
  }

  if (hasError) {
    results.summary.technical_errors++;
  }

  const questionCheck = checkLessonMatch(item.question || '');
  if (!questionCheck.valid) {
    detail.errors.push('lesson_mismatch');
    detail.explanation += `Từ không thuộc bài 5 trong question: ${questionCheck.invalidWords.join(', ')}. `;
    hasError = true;
    results.summary.lesson_mismatches++;
  }

  if (item.options) {
    item.options.forEach((opt, idx) => {
      const optCheck = checkLessonMatch(opt);
      if (!optCheck.valid) {
        detail.errors.push('lesson_mismatch');
        detail.explanation += `Từ không thuộc bài 5 trong option ${idx + 1}: ${optCheck.invalidWords.join(', ')}. `;
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
