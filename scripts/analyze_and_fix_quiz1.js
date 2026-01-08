const fs = require('fs');
const path = require('path');

const quizPath = path.join(__dirname, '..', 'data', 'quiz', 'quiz1.json');
const lessonPath = path.join(__dirname, '..', 'data', 'lesson', 'lesson1.json');
const grammarPath = path.join(__dirname, '..', 'data', 'grammar', 'grammar1.json');

const quiz = JSON.parse(fs.readFileSync(quizPath, 'utf8').replace(/^\uFEFF/, ''));
const lesson = JSON.parse(fs.readFileSync(lessonPath, 'utf8').replace(/^\uFEFF/, ''));
const grammar = JSON.parse(fs.readFileSync(grammarPath, 'utf8').replace(/^\uFEFF/, ''));

const lessonVocab = new Set();
lesson.forEach(item => {
  if (item.hiragana) lessonVocab.add(item.hiragana);
  if (item.kanji) lessonVocab.add(item.kanji);
});

const grammarPatterns = new Set();
grammar.forEach(item => {
  if (item.structure) {
    const patterns = item.structure.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g);
    if (patterns) {
      patterns.forEach(p => grammarPatterns.add(p));
    }
  }
});

const basicParticles = new Set(['は', 'が', 'を', 'に', 'で', 'から', 'まで', 'の', 'も', 'と', 'や', 'か']);
const basicWords = new Set(['です', 'ですか', 'でした', 'でしたか', 'じゃありません', 'ではありません']);

function extractVocabularyWords(text) {
  if (!text) return [];
  const words = [];
  const cleanText = text.replace(/<[^>]*>/g, '').replace(/<ruby>.*?<\/ruby>/g, '');
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
  let match;
  while ((match = japaneseRegex.exec(cleanText)) !== null) {
    const word = match[0];
    if (word.length > 1 || basicParticles.has(word) || basicWords.has(word)) {
      words.push(word);
    }
  }
  return words;
}

function isWordInLesson1(word) {
  if (lessonVocab.has(word)) return true;
  if (basicParticles.has(word)) return true;
  if (basicWords.has(word)) return true;
  if (word.includes('～')) {
    const base = word.replace('～', '');
    return lessonVocab.has(base) || basicParticles.has(base) || basicWords.has(base);
  }
  return false;
}

function hasVocabularyOutsideLesson1(text) {
  if (!text) return false;
  const words = extractVocabularyWords(text);
  return words.some(word => !isWordInLesson1(word));
}

function checkTechnicalErrors(item, allItems) {
  const errors = [];
  
  if (typeof item.id !== 'number') {
    errors.push('technical_error');
    return errors;
  }
  
  if (!item.question || item.question.trim() === '') {
    errors.push('technical_error');
  }
  
  if (!Array.isArray(item.options) || item.options.length < 2) {
    errors.push('technical_error');
  } else {
    const seenOptions = new Set();
    item.options.forEach((opt, idx) => {
      const key = opt.trim().toLowerCase();
      if (seenOptions.has(key)) {
        errors.push('technical_error');
      }
      seenOptions.add(key);
    });
  }
  
  if (typeof item.correctAnswer !== 'number' || 
      item.correctAnswer < 0 || 
      item.correctAnswer >= item.options.length) {
    errors.push('technical_error');
  }
  
  if (typeof item.difficulty !== 'number' || item.difficulty <= 0) {
    errors.push('technical_error');
  }
  
  const questionKey = item.question.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  const duplicates = allItems.filter((other, idx) => 
    idx !== allItems.indexOf(item) && 
    other.question.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().toLowerCase() === questionKey
  );
  if (duplicates.length > 0) {
    errors.push('technical_error');
  }
  
  return errors;
}

function checkAnswerErrors(item) {
  const errors = [];
  
  if (!item.options || item.correctAnswer < 0 || item.correctAnswer >= item.options.length) {
    return errors;
  }
  
  const correctAnswer = item.options[item.correctAnswer];
  const questionText = item.question.replace(/<[^>]*>/g, '').replace(/<ruby>.*?<\/ruby>/g, '');
  
  if (questionText.includes('ひと') && correctAnswer.toLowerCase().includes('người')) {
    if (!correctAnswer.toLowerCase().includes('người') && !correctAnswer.toLowerCase().includes('nguoi')) {
      errors.push('answer_error');
    }
  }
  
  if (questionText.includes('あのひと') && !correctAnswer.includes('あのひと')) {
    if (item.options.some(opt => opt.includes('あのひと'))) {
      errors.push('answer_error');
    }
  }
  
  if (questionText.includes('かた') && !correctAnswer.includes('かた')) {
    if (item.options.some(opt => opt.includes('かた'))) {
      errors.push('answer_error');
    }
  }
  
  if (questionText.includes('しゃいん') && !correctAnswer.toLowerCase().includes('nhân viên')) {
    if (item.options.some(opt => opt.toLowerCase().includes('nhân viên') || opt.toLowerCase().includes('nhan vien'))) {
      errors.push('answer_error');
    }
  }
  
  if (questionText.includes('がくせい') && !correctAnswer.toLowerCase().includes('học sinh') && !correctAnswer.toLowerCase().includes('sinh viên')) {
    if (item.options.some(opt => opt.toLowerCase().includes('học sinh') || opt.toLowerCase().includes('sinh viên') || opt.toLowerCase().includes('hoc sinh') || opt.toLowerCase().includes('sinh vien'))) {
      errors.push('answer_error');
    }
  }
  
  if (questionText.includes('せんせい') && !correctAnswer.toLowerCase().includes('thầy') && !correctAnswer.toLowerCase().includes('cô') && !correctAnswer.toLowerCase().includes('giáo viên')) {
    if (item.options.some(opt => opt.toLowerCase().includes('thầy') || opt.toLowerCase().includes('cô') || opt.toLowerCase().includes('giáo viên') || opt.toLowerCase().includes('giao vien'))) {
      errors.push('answer_error');
    }
  }
  
  if (questionText.includes('なんさい') && !correctAnswer.toLowerCase().includes('tuổi') && !correctAnswer.toLowerCase().includes('tuoi')) {
    if (item.options.some(opt => opt.toLowerCase().includes('tuổi') || opt.toLowerCase().includes('tuoi'))) {
      errors.push('answer_error');
    }
  }
  
  if (questionText.includes('おいくつ') && !correctAnswer.toLowerCase().includes('tuổi') && !correctAnswer.toLowerCase().includes('tuoi')) {
    if (item.options.some(opt => opt.toLowerCase().includes('tuổi') || opt.toLowerCase().includes('tuoi'))) {
      errors.push('answer_error');
    }
  }
  
  if (questionText.includes('だれ') && !correctAnswer.toLowerCase().includes('ai')) {
    if (item.options.some(opt => opt.toLowerCase().includes('ai'))) {
      errors.push('answer_error');
    }
  }
  
  if (questionText.includes('どなた') && !correctAnswer.toLowerCase().includes('ai') && !correctAnswer.toLowerCase().includes('người nào')) {
    if (item.options.some(opt => opt.toLowerCase().includes('ai') || opt.toLowerCase().includes('người nào') || opt.toLowerCase().includes('nguoi nao'))) {
      errors.push('answer_error');
    }
  }
  
  if (questionText.includes('こちらは') && !correctAnswer.toLowerCase().includes('đây')) {
    if (item.options.some(opt => opt.toLowerCase().includes('đây') || opt.toLowerCase().includes('day'))) {
      errors.push('answer_error');
    }
  }
  
  if (questionText.includes('はじめまして') && !correctAnswer.toLowerCase().includes('xin chào') && !correctAnswer.toLowerCase().includes('lần đầu')) {
    if (item.options.some(opt => opt.toLowerCase().includes('xin chào') || opt.toLowerCase().includes('lần đầu') || opt.toLowerCase().includes('xin chao') || opt.toLowerCase().includes('lan dau'))) {
      errors.push('answer_error');
    }
  }
  
  if (questionText.includes('どうぞよろしく') && !correctAnswer.toLowerCase().includes('giúp đỡ') && !correctAnswer.toLowerCase().includes('giup do')) {
    if (item.options.some(opt => opt.toLowerCase().includes('giúp đỡ') || opt.toLowerCase().includes('giup do'))) {
      errors.push('answer_error');
    }
  }
  
  if (questionText.includes('しつれいですが') && !correctAnswer.toLowerCase().includes('xin lỗi') && !correctAnswer.toLowerCase().includes('xin loi')) {
    if (item.options.some(opt => opt.toLowerCase().includes('xin lỗi') || opt.toLowerCase().includes('xin loi'))) {
      errors.push('answer_error');
    }
  }
  
  if (questionText.includes('～からきました') || questionText.includes('から きました')) {
    if (!correctAnswer.toLowerCase().includes('từ') && !correctAnswer.toLowerCase().includes('đến từ')) {
      if (item.options.some(opt => opt.toLowerCase().includes('từ') || opt.toLowerCase().includes('đến từ') || opt.toLowerCase().includes('den tu'))) {
        errors.push('answer_error');
      }
    }
  }
  
  return errors;
}

function checkLessonMismatch(item) {
  const errors = [];
  const violations = [];
  
  const questionWords = extractVocabularyWords(item.question);
  const questionViolations = questionWords.filter(word => !isWordInLesson1(word));
  if (questionViolations.length > 0) {
    violations.push(`question: ${questionViolations.join(', ')}`);
  }
  
  if (item.options) {
    item.options.forEach((opt, idx) => {
      const optWords = extractVocabularyWords(opt);
      const optViolations = optWords.filter(word => !isWordInLesson1(word));
      if (optViolations.length > 0) {
        violations.push(`option[${idx}]: ${optViolations.join(', ')}`);
      }
    });
  }
  
  if (violations.length > 0) {
    errors.push('lesson_mismatch');
  }
  
  return { errors, violations };
}

const analysis = {
  summary: {
    total: quiz.length,
    technical_errors: 0,
    answer_errors: 0,
    lesson_mismatches: 0
  },
  details: []
};

const seenQuestions = new Set();

quiz.forEach((item, idx) => {
  const detail = {
    id: item.id,
    status: 'PASS',
    errors: [],
    explanation: '',
    suggested_fix: null
  };
  
  const techErrors = checkTechnicalErrors(item, quiz);
  detail.errors.push(...techErrors);
  
  if (techErrors.length === 0) {
    const answerErrors = checkAnswerErrors(item);
    detail.errors.push(...answerErrors);
    
    const { errors: lessonErrors, violations } = checkLessonMismatch(item);
    detail.errors.push(...lessonErrors);
    
    if (lessonErrors.length > 0) {
      detail.explanation = `Vượt phạm vi bài 1: ${violations.join('; ')}`;
    } else if (answerErrors.length > 0) {
      detail.explanation = 'Đáp án không chính xác';
    }
  } else {
    detail.explanation = 'Lỗi kỹ thuật JSON';
  }
  
  if (detail.errors.length > 0) {
    detail.status = 'FAIL';
    if (detail.errors.includes('technical_error')) {
      analysis.summary.technical_errors++;
    }
    if (detail.errors.includes('answer_error')) {
      analysis.summary.answer_errors++;
    }
    if (detail.errors.includes('lesson_mismatch')) {
      analysis.summary.lesson_mismatches++;
    }
  }
  
  analysis.details.push(detail);
});

const outputPath = path.join(__dirname, '..', 'quiz1_analysis.json');
fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2), 'utf8');
console.log(`Phân tích đã được lưu tại: ${outputPath}`);
console.log(`Tổng: ${analysis.summary.total}`);
console.log(`Lỗi kỹ thuật: ${analysis.summary.technical_errors}`);
console.log(`Lỗi đáp án: ${analysis.summary.answer_errors}`);
console.log(`Không phù hợp bài học: ${analysis.summary.lesson_mismatches}`);
