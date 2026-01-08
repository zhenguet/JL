const fs = require('fs');
const path = require('path');

const quizPath = path.join(__dirname, '..', 'data', 'quiz', 'quiz3.json');
const lessonPath = path.join(__dirname, '..', 'data', 'lesson', 'lesson3.json');
const grammarPath = path.join(__dirname, '..', 'data', 'grammar', 'grammar3.json');

const quiz = JSON.parse(fs.readFileSync(quizPath, 'utf8').replace(/^\uFEFF/, ''));
const lesson = JSON.parse(fs.readFileSync(lessonPath, 'utf8').replace(/^\uFEFF/, ''));
const grammar = JSON.parse(fs.readFileSync(grammarPath, 'utf8').replace(/^\uFEFF/, ''));

const lessonVocab = new Map();
lesson.forEach(item => {
  if (item.hiragana) lessonVocab.set(item.hiragana, item);
  if (item.kanji) lessonVocab.set(item.kanji, item);
});

const basicGrammarParticles = new Set([
  'は', 'が', 'を', 'に', 'で', 'から', 'まで', 'の', 'も', 'と', 'や', 'か',
  'です', 'ですか', 'でした', 'でしたか', 'ます', 'ません', 'ました', 'ませんでした',
  'これ', 'それ', 'あれ', 'どれ', 'この', 'その', 'あの', 'どの',
  'ここ', 'そこ', 'あそこ', 'どこ', 'こちら', 'そちら', 'あちら', 'どちら',
  'なん', 'なに', 'いくら', 'いくつ', 'だれ', 'いつ',
  '～', '～えん', '～かい', '～かい', '～えん'
]);

const lesson3VocabWords = new Set();
lesson.forEach(item => {
  if (item.hiragana) lesson3VocabWords.add(item.hiragana);
  if (item.kanji) lesson3VocabWords.add(item.kanji);
  if (item.id === 'floor') lesson3VocabWords.add('～かい');
  if (item.id === 'yen') lesson3VocabWords.add('～えん');
});

function extractVocabularyWords(text) {
  if (!text) return [];
  const words = [];
  const cleanText = text.replace(/<[^>]*>/g, '').replace(/<ruby>.*?<\/ruby>/g, '');
  
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
  let match;
  while ((match = japaneseRegex.exec(cleanText)) !== null) {
    const word = match[0];
    if (word.length > 1 || !basicGrammarParticles.has(word)) {
      words.push(word);
    }
  }
  
  return words;
}

function isVocabularyInLesson3(text) {
  if (!text) return { inLesson: true, violations: [] };
  
  const violations = [];
  const words = extractVocabularyWords(text);
  
  words.forEach(word => {
    if (!lesson3VocabWords.has(word) && !basicGrammarParticles.has(word)) {
      if (word.includes('～')) {
        const base = word.replace('～', '');
        if (!lesson3VocabWords.has(base) && !basicGrammarParticles.has(base)) {
          violations.push({ word, type: 'vocabulary', reason: 'not_in_lesson3' });
        }
      } else {
        violations.push({ word, type: 'vocabulary', reason: 'not_in_lesson3' });
      }
    }
  });
  
  return { inLesson: violations.length === 0, violations };
}

function checkAnswerCorrectness(question, options, correctAnswer) {
  const errors = [];
  const correctOption = options[correctAnswer];
  const qText = question.replace(/<[^>]*>/g, '').replace(/<ruby>.*?<\/ruby>/g, '');
  
  if (qText.includes('cầu thang máy') || qText.includes('Thang máy')) {
    if (!correctOption.includes('エレベーター')) {
      errors.push('Đáp án sai: cầu thang máy phải là エレベーター');
    }
  }
  
  if (qText.includes('エレベーター')) {
    if (!correctOption.includes('thang máy') && !correctOption.includes('Thang máy') && !correctOption.includes('cầu thang máy')) {
      errors.push('Đáp án sai: エレベーター phải là thang máy/cầu thang máy');
    }
  }
  
  if (qText.includes('ロビー')) {
    if (!correctOption.includes('phòng đợi') && !correctOption.includes('tiền sảnh') && !correctOption.includes('Hành lang')) {
      errors.push('Đáp án sai: ロビー phải là phòng đợi/tiền sảnh');
    }
  }
  
  if (qText.includes('食堂') && !qText.includes('しょくどう')) {
    if (!correctOption.includes('しょくどう')) {
      errors.push('Đáp án sai: 食堂 phải đọc là しょくどう');
    }
  }
  
  if (qText.includes('しょくどう') && !qText.includes('食堂')) {
    if (!correctOption.includes('nhà ăn') && !correctOption.includes('phòng ăn')) {
      errors.push('Đáp án sai: しょくどう phải là nhà ăn/phòng ăn');
    }
  }
  
  if (qText.includes('階段') && !qText.includes('かいだん')) {
    if (!correctOption.includes('かいだん')) {
      errors.push('Đáp án sai: 階段 phải đọc là かいだん');
    }
  }
  
  if (qText.includes('かいだん') && !qText.includes('階段')) {
    if (!correctOption.includes('cầu thang')) {
      errors.push('Đáp án sai: かいだん phải là cầu thang');
    }
  }
  
  if (qText.includes('どちら') && (qText.includes('どこ') || qText.includes('nơi') || qText.includes('chỗ'))) {
    if (!correctOption.includes('ở đâu')) {
      errors.push('Đáp án sai: どちら (hỏi nơi chốn) phải là "ở đâu"');
    }
  }
  
  if (qText.includes('～えん') || qText.includes('～円')) {
    if (!correctOption.includes('～えん') && !correctOption.includes('yên')) {
      errors.push('Đáp án sai: ～円 phải đọc là ～えん');
    }
  }
  
  if (qText.includes('～かい') || qText.includes('～階')) {
    if (!correctOption.includes('～かい') && !correctOption.includes('tầng')) {
      errors.push('Đáp án sai: ～階 phải đọc là ～かい');
    }
  }
  
  if (qText.includes('いくら') && !qText.includes('bao nhiêu')) {
    if (!correctOption.includes('bao nhiêu tiền')) {
      errors.push('Đáp án sai: いくら phải là "bao nhiêu tiền"');
    }
  }
  
  if (qText.includes('おくに') || qText.includes('お国')) {
    if (!correctOption.includes('nước') && !correctOption.includes('quốc gia')) {
      errors.push('Đáp án sai: おくに phải là nước/quốc gia');
    }
  }
  
  if (qText.includes('へや') || qText.includes('部屋')) {
    if (!correctOption.includes('Phòng') && !correctOption.includes('phòng')) {
      errors.push('Đáp án sai: へや phải là phòng');
    }
  }
  
  if (qText.includes('にわ') || qText.includes('庭')) {
    if (!correctOption.includes('Sân') && !correctOption.includes('sân') && !correctOption.includes('Vườn')) {
      errors.push('Đáp án sai: にわ phải là sân/vườn');
    }
  }
  
  if (qText.includes('うち') || qText.includes('家')) {
    if (!correctOption.includes('Nhà') && !correctOption.includes('nhà')) {
      errors.push('Đáp án sai: うち phải là nhà');
    }
  }
  
  if (qText.includes('くつ') || qText.includes('靴')) {
    if (!correctOption.includes('giầy') && !correctOption.includes('Giầy')) {
      errors.push('Đáp án sai: くつ phải là giầy');
    }
  }
  
  if (qText.includes('ネクタイ')) {
    if (!correctOption.includes('cà vạt') && !correctOption.includes('Cà vạt')) {
      errors.push('Đáp án sai: ネクタイ phải là cà vạt');
    }
  }
  
  if (qText.includes('ワイン')) {
    if (!correctOption.includes('rượu vang') && !correctOption.includes('Rượu vang')) {
      errors.push('Đáp án sai: ワイン phải là rượu vang');
    }
  }
  
  if (qText.includes('せん') || qText.includes('千')) {
    if (!correctOption.includes('nghìn') && !correctOption.includes('Nghìn')) {
      errors.push('Đáp án sai: せん phải là nghìn');
    }
  }
  
  if (qText.includes('ひゃく') || qText.includes('百')) {
    if (!correctOption.includes('trăm') && !correctOption.includes('Trăm')) {
      errors.push('Đáp án sai: ひゃく phải là trăm');
    }
  }
  
  if (qText.includes('まん') || qText.includes('万')) {
    if (!correctOption.includes('vạn') && !correctOption.includes('mười nghìn')) {
      errors.push('Đáp án sai: まん phải là vạn/mười nghìn');
    }
  }
  
  if (qText.includes('ここ') && !correctOption.includes('chỗ này') && !correctOption.includes('Chỗ này')) {
    if (qText.toLowerCase().includes('chỗ này')) {
      if (!correctOption.includes('ここ')) {
        errors.push('Đáp án sai: chỗ này phải là ここ');
      }
    }
  }
  
  if (qText.includes('そこ') && !correctOption.includes('chỗ đó') && !correctOption.includes('Chỗ đó')) {
    if (qText.toLowerCase().includes('chỗ đó')) {
      if (!correctOption.includes('そこ')) {
        errors.push('Đáp án sai: chỗ đó phải là そこ');
      }
    }
  }
  
  if (qText.includes('あそこ') && !correctOption.includes('chỗ kia') && !correctOption.includes('Chỗ kia')) {
    if (qText.toLowerCase().includes('chỗ kia')) {
      if (!correctOption.includes('あそこ')) {
        errors.push('Đáp án sai: chỗ kia phải là あそこ');
      }
    }
  }
  
  return errors;
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
  const errors = [];
  let status = 'PASS';
  
  if (!item.id || seenIds.has(item.id)) {
    errors.push('technical_error');
    status = 'FAIL';
  }
  seenIds.add(item.id);
  
  if (!item.question || item.question.trim() === '') {
    errors.push('technical_error');
    status = 'FAIL';
  }
  
  if (!item.options || !Array.isArray(item.options) || item.options.length < 2) {
    errors.push('technical_error');
    status = 'FAIL';
  }
  
  const uniqueOptions = new Set(item.options);
  if (uniqueOptions.size !== item.options.length) {
    errors.push('technical_error');
    status = 'FAIL';
  }
  
  if (typeof item.correctAnswer !== 'number' || item.correctAnswer < 0 || item.correctAnswer >= item.options.length) {
    errors.push('technical_error');
    status = 'FAIL';
  }
  
  if (typeof item.difficulty !== 'number' || item.difficulty <= 0) {
    errors.push('technical_error');
    status = 'FAIL';
  }
  
  const questionKey = item.question.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  if (seenQuestions.has(questionKey)) {
    errors.push('technical_error');
    status = 'FAIL';
  }
  seenQuestions.add(questionKey);
  
  if (errors.includes('technical_error')) {
    results.summary.technical_errors++;
  }
  
  const answerErrors = checkAnswerCorrectness(item.question, item.options, item.correctAnswer);
  if (answerErrors.length > 0) {
    errors.push('answer_error');
    status = 'FAIL';
    results.summary.answer_errors++;
  }
  
  const questionCheck = isVocabularyInLesson3(item.question);
  const optionsCheck = item.options.map(opt => isVocabularyInLesson3(opt));
  
  const hasLessonMismatch = !questionCheck.inLesson || optionsCheck.some(check => !check.inLesson);
  
  if (hasLessonMismatch) {
    errors.push('lesson_mismatch');
    status = 'FAIL';
    results.summary.lesson_mismatches++;
  }
  
  let explanation = '';
  if (errors.length > 0) {
    const explanations = [];
    if (errors.includes('technical_error')) {
      explanations.push('Lỗi kỹ thuật: cấu trúc JSON không hợp lệ hoặc dữ liệu trùng lặp');
    }
    if (errors.includes('answer_error')) {
      explanations.push(`Lỗi đáp án: ${answerErrors.join('; ')}`);
    }
    if (errors.includes('lesson_mismatch')) {
      const violations = [];
      if (!questionCheck.inLesson) {
        violations.push(...questionCheck.violations.map(v => `${v.word}`));
      }
      optionsCheck.forEach((check, idx) => {
        if (!check.inLesson) {
          violations.push(...check.violations.map(v => `option[${idx}]: ${v.word}`));
        }
      });
      if (violations.length > 0) {
        explanations.push(`Vượt phạm vi bài 3: ${violations.join(', ')}`);
      }
    }
    explanation = explanations.join(' | ');
  }
  
  const detail = {
    id: item.id,
    status,
    errors: errors.length > 0 ? errors : [],
    explanation: explanation || 'Không có lỗi'
  };
  
  if (errors.length > 0) {
    detail.suggested_fix = {
      question: item.question,
      options: item.options,
      correctAnswer: item.correctAnswer
    };
  }
  
  results.details.push(detail);
});

const outputPath = path.join(__dirname, '..', 'quiz3_analysis.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
console.log(JSON.stringify(results, null, 2));
