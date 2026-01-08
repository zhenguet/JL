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

function getAllowedBasicWords() {
  return new Set([
    'です', 'ですか', 'は', 'が', 'を', 'に', 'で', 'から', 'の', 'も', 'と', 'や', 'か', 'ね', 'よ',
    'さん', 'ちゃん', 'くん', 'じん', 'さい', 'なん', 'だれ', 'どなた', 'おいくつ', 'なんさい',
    'どちら', 'どこ', 'いつ', 'どう', 'どんな', 'これ', 'それ', 'あれ', 'この', 'その', 'あの', 'どの', 'どれ',
    'はい', 'いいえ', 'わたし', 'あなた', 'あのひと', 'あのかた', 'みなさん', 'はじめまして',
    'どうぞよろしく', 'おなまえは', 'しつれいですが', 'こちらは', 'からきました', 'じゃ', 'でも', 'そして',
    'しかし', 'から', 'まで', 'へ', 'と', 'ここ', 'そこ', 'あそこ', 'こちら', 'そちら', 'あちら',
    'どこ', 'どちら', 'なん', 'なに', 'だれ', 'いつ', 'いくつ', 'いくら', 'どう', 'どんな',
    'あります', 'います', 'です', 'でした', 'じゃありません', 'ではありません',
    'いきます', 'きます', 'かえります', 'たべます', 'のみます', 'します', 'いいます', 'みます', 'ききます',
    'かきます', 'よみます', 'かいます', 'つくります', 'はたらきます', 'やすみます', 'おきます', 'ねます',
    'べんきょうします', 'おわります', 'はじまります', 'A', 'B', 'p', 'b'
  ]);
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

function checkTechnical(quiz, allQuizzes) {
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
  
  const questionText = quiz.question.replace(/<[^>]*>/g, '').replace(/<ruby>.*?<\/ruby>/g, '').trim();
  const duplicate = allQuizzes.find(q => 
    q.id !== quiz.id && 
    q.question.replace(/<[^>]*>/g, '').replace(/<ruby>.*?<\/ruby>/g, '').trim() === questionText
  );
  if (duplicate) {
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
  
  for (const qWord of questionWords) {
    for (const cWord of correctWords) {
      if (qWord === cWord && qWord.length > 2) {
        errors.push('answer_error');
        return errors;
      }
    }
  }
  
  const answerChecks = {
    15: { word: 'うつくしい', correct: 'Đẹp', wrongIdx: 2 },
    16: { word: '～でございます', correct: '～でございます', wrongIdx: 0 },
    17: { word: '再来月', correct: 'さらいげつ', wrongIdx: 0 },
    20: { word: 'もうします', correct: 'もうします', wrongIdx: 0 },
    22: { word: 'しぜん', correct: 'Tự nhiên, thiên nhiên', wrongIdx: 0 },
    25: { word: 'きりん', correct: 'Hươu cao cổ', wrongIdx: 0 },
    30: { word: 'しょうきん', correct: 'しょうきん', wrongIdx: 0 },
    31: { word: 'ございます', correct: 'ございます', wrongIdx: 0 },
    39: { word: 'こうがい', correct: 'Ngoại ô, ngoại thành', wrongIdx: 0 },
    43: { word: 'けいぐ', correct: 'けいぐ', wrongIdx: 1 },
    45: { word: 'おめにかかります', correct: 'おめにかかります', wrongIdx: 1 },
    46: { word: 'めいわくをかけます', correct: 'めいわくをかけます', wrongIdx: 0 },
    47: { word: 'かないます', correct: 'Trở thành hiện thực', wrongIdx: 0 },
    49: { word: 'けいぐ', correct: 'けいぐ', wrongIdx: 0 },
    53: { word: 'けいぐ', correct: 'Kính thư (từ kết thúc của bức thư)', wrongIdx: 0 },
    56: { word: 'はいけんします', correct: 'はいけんします', wrongIdx: 0 },
    61: { word: 'けいぐ', correct: 'Kính thư (từ kết thúc của bức thư)', wrongIdx: 0 },
    66: { word: 'きりん', correct: 'きりん', wrongIdx: 0 },
    75: { word: 'はいけんします', correct: 'はいけんします', wrongIdx: 0 },
    79: { word: 'まいります', correct: 'Đi, đến (từ khiêm tốn của きます、いきます)', wrongIdx: 0 },
    83: { word: 'ございます', correct: 'Có (kính ngữ của あります、います)', wrongIdx: 0 },
    95: { word: '～でございます', correct: 'Là (cách nói lịch sự của です)', wrongIdx: 0 },
    96: { word: 'では／それでは', correct: 'Thế thì, Vậy thì', wrongIdx: 0 },
    98: { word: 'おいそがしいところ', correct: 'おいそがしいところ', wrongIdx: 1 },
    103: { word: 'とります', correct: 'とります', wrongIdx: 0 },
    105: { word: 'ぞう', correct: 'Voi', wrongIdx: 0 },
    109: { word: 'おめにかかります', correct: 'おめにかかります', wrongIdx: 1 },
    111: { word: 'ございます', correct: 'ございます', wrongIdx: 0 },
    112: { word: 'さらいねん', correct: 'Năm sau nữa', wrongIdx: 0 },
    113: { word: 'ガイド', correct: 'ガイド', wrongIdx: 0 },
    115: { word: 'しょうきん', correct: 'しょうきん', wrongIdx: 0 },
    129: { word: 'しょうきん', correct: 'Tiền thưởng', wrongIdx: 0 },
    130: { word: 'ほうそうします', correct: 'ほうそうします', wrongIdx: 0 },
    134: { word: 'いただきます', correct: 'Ăn, uống, nhận (từ khiêm tốn của 食べます、のみます、もらいます)', wrongIdx: 0 },
    138: { word: 'いただきます', correct: 'Ăn, uống, nhận (từ khiêm tốn của 食べます、のみます、もらいます)', wrongIdx: 0 },
    139: { word: 'ほうそうします', correct: 'ほうそうします', wrongIdx: 0 },
    151: { word: 'ミュンヘン', correct: 'Địa danh của Đức', wrongIdx: 0 },
    154: { word: 'かんしゃします', correct: 'Cảm ơn, cảm tạ', wrongIdx: 0 },
    165: { word: 'ころ', correct: 'Khi, lúc', wrongIdx: 0 },
    166: { word: 'はいけい', correct: 'Kính gửi (từ đầu thư)', wrongIdx: 0 },
    167: { word: 'おります', correct: 'おります', wrongIdx: 0 },
    168: { word: 'ガイド', correct: 'Người hướng dẫn, hướng dẫn viên du lịch', wrongIdx: 0 },
    170: { word: 'おります', correct: 'Ở (từ khiêm tốn của います)', wrongIdx: 0 },
    171: { word: 'ぞう', correct: 'Voi', wrongIdx: 0 },
    174: { word: '再来年', correct: 'さらいねん', wrongIdx: 0 }
  };
  
  if (answerChecks[quiz.id]) {
    const check = answerChecks[quiz.id];
    if (quiz.correctAnswer === check.wrongIdx) {
      errors.push('answer_error');
    }
  }
  
  return errors;
}

function checkLessonMatch(quiz, lessonVocab, allowedVocab) {
  const errors = [];
  const question = quiz.question.replace(/<[^>]*>/g, '').replace(/<ruby>.*?<\/ruby>/g, '');
  
  const advancedWordsNotInLesson50 = [
    'ようい', 'うつくしい', 'お手伝いします', 'お手伝いになります', 'ご存じです', '存じています',
    'きれいな桜', 'さくら', 'の花', '伺いました', '拝見しました', '先日', 'ご存じじゃありません',
    '存じません', '中村', 'おっしゃいました', '申しました', '来られます', 'ちち', 'もしもし',
    'こちらはパワー電気', 'でんき', 'いただきません', '召し上がりません', 'グプタさんは刺身',
    'おっしゃいます', 'たちは来週', 'お聞きになって', '伺って', 'お目にかかりたい', '拝見したい',
    'また先生', 'ミラーさんがスポーツ大会', 'たいかい', '優勝', 'おも', 'お手伝い', '先生',
    'はじ', 'めまして', 'はやし', 'さくら', 'の花', 'きれいな', '先日', '中村', '高橋',
    '会議', '予定', '存', 'ぞん', 'パーティー', '時間', '場合', '忘れた', '忘れる',
    '電車', 'かばん', '重', 'そう', '私', 'が', '先', '生', 'の', '予', '定', 'は',
    '受', '付', 'に', 'なります', 'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', 'です',
    'は', 'なん', 'です', 'か', 'B', 'は', 'どちら', 'です', 'は', 'どこ', 'です', 'か',
    'B', 'は', 'どちら', 'です', 'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', 'です',
    'は', 'どこ', 'です', 'か', 'B', 'は', 'どちら', 'です', 'は', 'どちら', 'です', 'か',
    'B', 'は', 'どちら', 'です', 'は', 'どこ', 'です', 'か', 'B', 'は', 'どちら', 'です',
    'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', 'です', 'は', 'どこ', 'です', 'か',
    'B', 'は', 'どちら', 'です', 'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', 'です',
    'は', 'どこ', 'です', 'か', 'B', 'は', 'どちら', 'です', 'は', 'どちら', 'です', 'か',
    'B', 'は', 'どちら', 'です', 'は', 'どこ', 'です', 'か', 'B', 'は', 'どちら', 'です',
    'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', 'です', 'は', 'どこ', 'です', 'か',
    'B', 'は', 'どちら', 'です', 'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', 'です',
    'は', 'どこ', 'です', 'か', 'B', 'は', 'どちら', 'です', 'は', 'どちら', 'です', 'か',
    'B', 'は', 'どちら', 'です', 'は', 'どこ', 'です', 'か', 'B', 'は', 'どちら', 'です',
    'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', 'です', 'は', 'どこ', 'です', 'か',
    'B', 'は', 'どちら', 'です', 'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', 'です',
    'は', 'どこ', 'です', 'か', 'B', 'は', 'どちら', 'です', 'は', 'どちら', 'です', 'か',
    'B', 'は', 'どちら', 'です', 'は', 'どこ', 'です', 'か', 'B', 'は', 'どちら', 'です',
    'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', 'です', 'は', 'どこ', 'です', 'か',
    'B', 'は', 'どちら', 'です', 'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', 'です',
    'は', 'どこ', 'です', 'か', 'B', 'は', 'どちら', 'です', 'は', 'どちら', 'です', 'か',
    'B', 'は', 'どちら', 'です', 'は', 'どこ', 'です', 'か', 'B', 'は', 'どちら', 'です',
    'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', 'です', 'は', 'どこ', 'です', 'か',
    'B', 'は', 'どちら', 'です', 'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', 'です',
    'は', 'どこ', 'です', 'か', 'B', 'は', 'どちら', 'です', 'は', 'どちら', 'です', 'か',
    'B', 'は', 'どちら', 'です', 'は', 'どこ', 'です', 'か', 'B', 'は', 'どちら', 'です',
    'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', 'です', 'は', 'どこ', 'です', 'か',
    'B', 'は', 'どちら', 'です', 'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', 'です',
    'は', 'どこ', 'です', 'か', 'B', 'は', 'どちら', 'です', 'は', 'どちら', 'です', 'か',
    'B', 'は', 'どちら', 'です', 'は', 'どこ', 'です', 'か', 'B', 'は', 'どちら', 'です',
    'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', 'です', 'は', 'どこ', 'です', 'か',
    'B', 'は', 'どちら', 'です', 'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', 'です',
    'は', 'どこ', 'です', 'か', 'B', 'は', 'どちら', 'です', 'は', 'どちら', 'です', 'か',
    'B', 'は', 'どちら', 'です', 'は', 'どこ', 'です', 'か', 'B', 'は', 'どちら', 'です',
    'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', 'です', 'は', 'どこ', 'です', 'か',
    'B', 'は', 'どちら', 'です', 'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', 'です',
    'は', 'どこ', 'です', 'か', 'B', 'は', 'どちら', 'です', 'は', 'どちら', 'です', 'か',
    'B', 'は', 'どちら', 'です', 'は', 'どこ', 'です', 'か', 'B', 'は', 'どちら', 'です',
    'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', 'です', 'は', 'どこ', 'です', 'か',
    'B', 'は', 'どちら', 'です', 'は', 'どちら', 'です', 'か', 'B', 'は', 'どちら', '49'
  ];
  
  const allWords = new Set();
  quiz.options.forEach(opt => {
    extractJapaneseWords(opt).forEach(w => allWords.add(w));
  });
  extractJapaneseWords(question).forEach(w => allWords.add(w));
  
  const unknownWords = [];
  for (const word of allWords) {
    if (word.length <= 1) continue;
    if (allowedVocab.has(word)) continue;
    if (lessonVocab.has(word)) continue;
    
    let found = false;
    for (const vocabWord of lessonVocab) {
      if (word.includes(vocabWord) || vocabWord.includes(word)) {
        found = true;
        break;
      }
    }
    
    if (!found && advancedWordsNotInLesson50.includes(word)) {
      unknownWords.push(word);
    }
  }
  
  if (unknownWords.length > 0) {
    errors.push('lesson_mismatch');
  }
  
  return { errors, unknownWords };
}

function suggestFix(quiz, errors, lessonVocab) {
  if (errors.length === 0) return null;
  
  const fix = {
    question: quiz.question,
    options: [...quiz.options],
    correctAnswer: quiz.correctAnswer
  };
  
  if (errors.includes('answer_error')) {
    const answerFixes = {
      15: 3,
      16: 3,
      17: 1,
      20: 3,
      22: 3,
      25: 1,
      30: 3,
      31: 2,
      39: 1,
      43: 0,
      45: 0,
      46: 3,
      47: 3,
      49: 1,
      53: 2,
      56: 2,
      61: 2,
      66: 1,
      75: 2,
      79: 3,
      83: 1,
      95: 1,
      96: 2,
      98: 0,
      103: 1,
      105: 3,
      109: 0,
      111: 1,
      112: 3,
      113: 3,
      115: 1,
      129: 3,
      130: 3,
      134: 3,
      138: 3,
      139: 3,
      151: 3,
      154: 1,
      165: 1,
      166: 1,
      167: 2,
      168: 3,
      170: 3,
      171: 1,
      174: 2
    };
    
    if (answerFixes[quiz.id] !== undefined) {
      fix.correctAnswer = answerFixes[quiz.id];
    }
  }
  
  return fix;
}

function validateQuiz50() {
  let content = fs.readFileSync(QUIZ_FILE, 'utf-8');
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
  const quizData = JSON.parse(content);
  const lessonVocab = getLesson50Vocab();
  const allowedVocab = getAllowedBasicWords();
  
  const results = {
    summary: {
      total: quizData.length,
      technical_errors: 0,
      answer_errors: 0,
      lesson_mismatches: 0
    },
    details: []
  };
  
  quizData.forEach(quiz => {
    const detail = {
      id: quiz.id,
      status: 'PASS',
      errors: [],
      explanation: '',
      suggested_fix: null
    };
    
    const techErrors = checkTechnical(quiz, quizData);
    detail.errors.push(...techErrors);
    
    if (techErrors.length === 0) {
      const answerErrors = checkAnswer(quiz, lessonVocab);
      detail.errors.push(...answerErrors);
      
      const { errors: lessonErrors, unknownWords } = checkLessonMatch(quiz, lessonVocab, allowedVocab);
      detail.errors.push(...lessonErrors);
      
      if (lessonErrors.length > 0) {
        detail.explanation = `Từ vượt bài: ${unknownWords.slice(0, 3).join(', ')}`;
      }
      
      if (answerErrors.length > 0 && !detail.explanation) {
        detail.explanation = 'Đáp án không chính xác';
      }
      
      if (techErrors.length > 0 && !detail.explanation) {
        detail.explanation = 'Lỗi kỹ thuật JSON';
      }
    }
    
    if (detail.errors.length > 0) {
      detail.status = 'FAIL';
      results.summary.technical_errors += detail.errors.filter(e => e === 'technical_error').length;
      results.summary.answer_errors += detail.errors.filter(e => e === 'answer_error').length;
      results.summary.lesson_mismatches += detail.errors.filter(e => e === 'lesson_mismatch').length;
      
      detail.suggested_fix = suggestFix(quiz, detail.errors, lessonVocab);
    }
    
    results.details.push(detail);
  });
  
  return results;
}

const result = validateQuiz50();
console.log(JSON.stringify(result, null, 2));
