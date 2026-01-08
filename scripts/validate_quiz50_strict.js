const fs = require('fs');
const path = require('path');

const QUIZ_FILE = path.join(__dirname, '..', 'data', 'quiz', 'quiz50.json');
const LESSON_FILE = path.join(__dirname, '..', 'data', 'lesson', 'lesson50.json');

function getLesson50Vocab() {
  const vocab = new Set();
  try {
    let content = fs.readFileSync(LESSON_FILE, 'utf-8');
    if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
    const data = JSON.parse(content);
    data.forEach(item => {
      if (item.hiragana) vocab.add(item.hiragana);
      if (item.kanji && item.kanji.trim()) {
        vocab.add(item.kanji.replace(/～/g, '').trim());
      }
    });
  } catch (e) {
    console.error('Error reading lesson50:', e.message);
  }
  return vocab;
}

function extractJapaneseWords(text) {
  if (!text) return new Set();
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/<ruby>.*?<\/ruby>/g, '');
  text = text.replace(/<rp>.*?<\/rp>/g, '');
  text = text.replace(/<rt>.*?<\/rt>/g, '');
  const pattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]+/g;
  const matches = text.match(pattern) || [];
  return new Set(matches.filter(w => w.length > 0));
}

function checkTechnical(quiz) {
  const errors = [];
  
  if (typeof quiz.id !== 'number') {
    errors.push('technical_error');
  }
  
  if (!quiz.question || typeof quiz.question !== 'string' || quiz.question.trim().length === 0) {
    errors.push('technical_error');
  }
  
  if (!Array.isArray(quiz.options) || quiz.options.length < 2) {
    errors.push('technical_error');
  }
  
  const uniqueOptions = new Set(quiz.options.map(o => o.trim().toLowerCase()));
  if (uniqueOptions.size !== quiz.options.length) {
    errors.push('technical_error');
  }
  
  if (typeof quiz.correctAnswer !== 'number' || 
      quiz.correctAnswer < 0 || 
      quiz.correctAnswer >= quiz.options.length) {
    errors.push('technical_error');
  }
  
  if (typeof quiz.difficulty !== 'number' || quiz.difficulty < 1) {
    errors.push('technical_error');
  }
  
  return errors;
}

function checkAnswer(quiz, lessonVocab) {
  const errors = [];
  const correctValue = quiz.options[quiz.correctAnswer];
  const question = quiz.question.replace(/<[^>]*>/g, '').replace(/<ruby>.*?<\/ruby>/g, '');
  
  const questionWords = extractJapaneseWords(question);
  const correctWords = extractJapaneseWords(correctValue);
  
  if (questionWords.size > 0 && correctWords.size > 0) {
    for (const qWord of questionWords) {
      for (const cWord of correctWords) {
        if (qWord === cWord && qWord.length > 1) {
          errors.push('answer_error');
          break;
        }
      }
      if (errors.includes('answer_error')) break;
    }
  }
  
  const commonMistakes = {
    'かんしゃ': ['かんさ', 'かんじゃ'],
    'まいります': ['まいりま', 'まいり'],
    'おります': ['おりま', 'おり'],
    'いただきます': ['いただきま', 'いただき'],
    'もうします': ['もうしま', 'もうし'],
    'ぞんじます': ['ぞんじま', 'ぞんじ'],
    'うかがいます': ['うかがいま', 'うかがい'],
    'ございます': ['ございま', 'ござい'],
    'でございます': ['でございま', 'でござい'],
    'きょうりょくします': ['きょうりょくしま', 'きょうりょく'],
    'かんしゃします': ['かんしゃしま', 'かんしゃ'],
    'ほうそうします': ['ほうそうしま', 'ほうそう'],
    'はいけんします': ['はいけんしま', 'はいけん'],
    'えどとうきょうはくぶつかん': ['えどとうきょうはくぶつか', 'えどとうきょう'],
    'しょうきん': ['しょうき', 'しょきん', 'じょうきん'],
    'さらいしゅう': ['さらいしゅ', 'ならいしゅう'],
    'さらいげつ': ['さらいげ', 'ならいげつ'],
    'さらいねん': ['さらいね', 'ならいねん'],
    'みなさま': ['みなさ', 'みなさん'],
    'わたくし': ['わたく', 'わたし'],
    'おれい': ['おれ', 'れい'],
    'きりん': ['きり', 'ぎりん'],
    'ぞう': ['そう', 'ぞ'],
    'しぜん': ['しぜ', 'じぜん'],
    'きんちょうします': ['きんちょうしま', 'きんちょう'],
    'めいわくをかけます': ['めいわくをかけま', 'めいわく'],
    'おいそがしい': ['おいそがし', 'いそがしい'],
    'ごしんせつ': ['ごしんせ', 'しんせつ'],
    'おめにかかります': ['おめにかかりま', 'おめにかかり'],
    'ごしゅっせきくださいまして': ['ごしゅっせきくださいまし', 'ごしゅっせき'],
    'おいそがしいところ': ['おいそがしいところ', 'いそがしいところ'],
    'はいけい': ['はいけ', 'はいけい'],
    'けいぐ': ['けい', 'けぐ'],
    'ころ': ['こ', 'ごろ'],
    'こうがい': ['こうが', 'ごうがい'],
    'そうべつかい': ['そうべつか', 'そうべつ'],
    'ひとことよろしいでしょうか': ['ひとことよろしいです', 'ひとこと'],
    'こころから': ['こころか', 'ころから'],
    'ぶじに': ['ぶじ', 'ふじに']
  };
  
  for (const [correct, mistakes] of Object.entries(commonMistakes)) {
    if (correctValue.includes(correct) && mistakes.some(m => correctValue.includes(m))) {
      errors.push('answer_error');
      break;
    }
  }
  
  return errors;
}

function checkLessonMatch(quiz, lessonVocab) {
  const errors = [];
  const question = quiz.question.replace(/<[^>]*>/g, '').replace(/<ruby>.*?<\/ruby>/g, '');
  
  const commonWords = new Set([
    'です', 'ですか', 'は', 'が', 'を', 'に', 'で', 'から', 'の', 'も', 'と', 'や',
    'か', 'ね', 'よ', 'さん', 'ちゃん', 'くん', 'じん', 'さい', 'なん', 'だれ',
    'どなた', 'おいくつ', 'なんさい', 'どちら', 'どこ', 'いつ', 'どう', 'どんな',
    'これ', 'それ', 'あれ', 'この', 'その', 'あの', 'どの', 'どれ', 'はい', 'いいえ',
    'わたし', 'あなた', 'あのひと', 'あのかた', 'みなさん', 'はじめまして',
    'どうぞよろしく', 'おなまえは', 'しつれいですが', 'こちらは', 'からきました',
    'じゃ', 'でも', 'そして', 'しかし', 'から', 'まで', 'へ', 'と', 'A', 'B', 'p', 'b'
  ]);
  
  const allWords = new Set();
  quiz.options.forEach(opt => {
    extractJapaneseWords(opt).forEach(w => allWords.add(w));
  });
  extractJapaneseWords(question).forEach(w => allWords.add(w));
  
  const unknownWords = [];
  for (const word of allWords) {
    if (word.length <= 1) continue;
    if (commonWords.has(word)) continue;
    if (lessonVocab.has(word)) continue;
    
    let found = false;
    for (const vocabWord of lessonVocab) {
      if (word.includes(vocabWord) || vocabWord.includes(word)) {
        found = true;
        break;
      }
    }
    
    if (!found) {
      unknownWords.push(word);
    }
  }
  
  if (unknownWords.length > 0) {
    errors.push('lesson_mismatch');
  }
  
  return { errors, unknownWords };
}

function validateQuiz50() {
  let content = fs.readFileSync(QUIZ_FILE, 'utf-8');
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
  const quizData = JSON.parse(content);
  const lessonVocab = getLesson50Vocab();
  
  const results = {
    summary: {
      total: quizData.length,
      technical_errors: 0,
      answer_errors: 0,
      lesson_mismatches: 0
    },
    details: []
  };
  
  const seenQuestions = new Map();
  const seenIds = new Set();
  
  quizData.forEach(quiz => {
    const detail = {
      id: quiz.id,
      status: 'PASS',
      errors: [],
      explanation: '',
      suggested_fix: null
    };
    
    if (seenIds.has(quiz.id)) {
      detail.status = 'FAIL';
      detail.errors.push('technical_error');
      detail.explanation = 'ID trùng lặp';
    }
    seenIds.add(quiz.id);
    
    const questionText = quiz.question.replace(/<[^>]*>/g, '').replace(/<ruby>.*?<\/ruby>/g, '').trim();
    if (seenQuestions.has(questionText)) {
      detail.status = 'FAIL';
      detail.errors.push('technical_error');
      detail.explanation = 'Câu hỏi trùng nội dung với ID ' + seenQuestions.get(questionText);
    } else {
      seenQuestions.set(questionText, quiz.id);
    }
    
    const techErrors = checkTechnical(quiz);
    detail.errors.push(...techErrors);
    
    if (techErrors.length === 0) {
      const answerErrors = checkAnswer(quiz, lessonVocab);
      detail.errors.push(...answerErrors);
      
      const { errors: lessonErrors, unknownWords } = checkLessonMatch(quiz, lessonVocab);
      detail.errors.push(...lessonErrors);
      
      if (lessonErrors.length > 0) {
        detail.explanation = `Từ vượt bài: ${unknownWords.slice(0, 3).join(', ')}`;
      }
    }
    
    if (detail.errors.length > 0) {
      detail.status = 'FAIL';
      results.summary.technical_errors += detail.errors.filter(e => e === 'technical_error').length;
      results.summary.answer_errors += detail.errors.filter(e => e === 'answer_error').length;
      results.summary.lesson_mismatches += detail.errors.filter(e => e === 'lesson_mismatch').length;
    }
    
    results.details.push(detail);
  });
  
  return results;
}

const result = validateQuiz50();
console.log(JSON.stringify(result, null, 2));
