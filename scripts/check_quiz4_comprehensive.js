const fs = require('fs');
const path = require('path');

const QUIZ_FILE = path.join(__dirname, '..', 'data', 'quiz', 'quiz4.json');
const LESSON_FILE = path.join(__dirname, '..', 'data', 'lesson', 'lesson4.json');
const GRAMMAR_FILE = path.join(__dirname, '..', 'data', 'grammar', 'grammar4.json');

const quizData = JSON.parse(fs.readFileSync(QUIZ_FILE, 'utf8').replace(/^\uFEFF/, ''));
const lessonData = JSON.parse(fs.readFileSync(LESSON_FILE, 'utf8').replace(/^\uFEFF/, ''));
const grammarData = JSON.parse(fs.readFileSync(GRAMMAR_FILE, 'utf8').replace(/^\uFEFF/, ''));

const vocabularyMap = new Map();
lessonData.forEach(word => {
  vocabularyMap.set(word.hiragana.toLowerCase(), word);
  if (word.kanji) {
    vocabularyMap.set(word.kanji, word);
  }
  if (word.vi) {
    vocabularyMap.set(word.vi.toLowerCase(), word);
  }
});

const allowedVocabulary = new Set();
lessonData.forEach(word => {
  allowedVocabulary.add(word.hiragana.toLowerCase());
  if (word.kanji) allowedVocabulary.add(word.kanji);
  if (word.vi) allowedVocabulary.add(word.vi.toLowerCase());
});

const allowedGrammarPatterns = [
  'から', 'まで', 'と', 'に', 'は', 'です', 'ます', 'ません', 'ました', 'ませんでした',
  'なんじ', 'なんぷん', 'なんようび', 'なんばん', '何時', '何分', '何曜日', '何番',
  '～じ', '～ぶん', '～ふん', '～はん', '～から', '～まで', '～と～'
];

function extractJapaneseText(text) {
  if (!text) return [];
  const japanese = [];
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
  let match;
  while ((match = japaneseRegex.exec(text)) !== null) {
    japanese.push(match[0]);
  }
  return japanese;
}

function extractVietnameseText(text) {
  if (!text) return [];
  const vietnamese = [];
  const vietnameseRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐa-zA-Z\s]+/g;
  let match;
  while ((match = vietnameseRegex.exec(text)) !== null) {
    const word = match[0].trim();
    if (word.length > 1 && !word.match(/^(です|ます|ません|でした|か|は|が|を|に|で|と|から|まで|ね|よ)$/)) {
      vietnamese.push(word.toLowerCase());
    }
  }
  return vietnamese;
}

function cleanHTML(text) {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').replace(/<ruby>.*?<\/ruby>/g, '').replace(/\([^)]*\)/g, '').trim();
}

function checkTechnicalErrors(quiz, allQuizzes) {
  const errors = [];
  
  if (quiz.id === undefined || quiz.id === null) {
    errors.push('technical_error');
  }
  
  const duplicateIds = allQuizzes.filter(q => q.id === quiz.id);
  if (duplicateIds.length > 1) {
    errors.push('technical_error');
  }
  
  if (!quiz.question || cleanHTML(quiz.question).trim() === '') {
    errors.push('technical_error');
  }
  
  if (!Array.isArray(quiz.options) || quiz.options.length < 2) {
    errors.push('technical_error');
  }
  
  const duplicateOptions = quiz.options.filter((opt, idx) => quiz.options.indexOf(opt) !== idx);
  if (duplicateOptions.length > 0) {
    errors.push('technical_error');
  }
  
  if (typeof quiz.correctAnswer !== 'number' || 
      quiz.correctAnswer < 0 || 
      quiz.correctAnswer >= quiz.options.length) {
    errors.push('technical_error');
  }
  
  if (typeof quiz.difficulty !== 'number' || quiz.difficulty <= 0) {
    errors.push('technical_error');
  }
  
  const duplicateQuestions = allQuizzes.filter(q => 
    q.id !== quiz.id && cleanHTML(q.question) === cleanHTML(quiz.question)
  );
  if (duplicateQuestions.length > 0) {
    errors.push('technical_error');
  }
  
  return errors;
}

function checkAnswerCorrectness(quiz) {
  const errors = [];
  const question = cleanHTML(quiz.question);
  const correctAnswer = quiz.options[quiz.correctAnswer];
  
  if (!correctAnswer) {
    errors.push('answer_error');
    return errors;
  }
  
  const questionJP = extractJapaneseText(question);
  const questionVI = extractVietnameseText(question);
  const answerJP = extractJapaneseText(correctAnswer);
  const answerVI = extractVietnameseText(correctAnswer);
  
  let hasCorrectMatch = false;
  
  for (const jp of questionJP) {
    const word = vocabularyMap.get(jp);
    if (word) {
      if (answerJP.some(a => vocabularyMap.get(a) === word)) {
        hasCorrectMatch = true;
        break;
      }
      if (answerVI.some(a => a === word.vi.toLowerCase())) {
        hasCorrectMatch = true;
        break;
      }
    }
  }
  
  for (const vi of questionVI) {
    const word = Array.from(vocabularyMap.values()).find(w => w.vi && w.vi.toLowerCase() === vi);
    if (word) {
      if (answerJP.some(a => vocabularyMap.get(a) === word)) {
        hasCorrectMatch = true;
        break;
      }
      if (answerVI.some(a => a === word.vi.toLowerCase())) {
        hasCorrectMatch = true;
        break;
      }
    }
  }
  
  if (question.includes('あさって') && !correctAnswer.includes('ngày kia') && !correctAnswer.includes('あさって')) {
    errors.push('answer_error');
  }
  
  if (question.includes('やすみます') && !correctAnswer.includes('nghỉ')) {
    errors.push('answer_error');
  }
  
  if (question.includes('べんきょう') && !correctAnswer.includes('học') && !correctAnswer.includes('べんきょう')) {
    errors.push('answer_error');
  }
  
  if (question.includes('図書館') && !correctAnswer.includes('としょかん')) {
    errors.push('answer_error');
  }
  
  if (question.includes('銀行') && !correctAnswer.includes('ぎんこう')) {
    errors.push('answer_error');
  }
  
  if (question.includes('美術館') && !correctAnswer.includes('びじゅつかん')) {
    errors.push('answer_error');
  }
  
  if (question.includes('郵便局') && !correctAnswer.includes('ゆうびんきょく')) {
    errors.push('answer_error');
  }
  
  if (question.includes('ロンドン') && !correctAnswer.includes('London')) {
    errors.push('answer_error');
  }
  
  if (question.includes('ペキン') && !correctAnswer.includes('Bắc Kinh')) {
    errors.push('answer_error');
  }
  
  if (question.includes('～まで') && !correctAnswer.includes('đến')) {
    errors.push('answer_error');
  }
  
  if (question.includes('～から') && !correctAnswer.includes('từ')) {
    errors.push('answer_error');
  }
  
  if (question.includes('～と～') && !correctAnswer.includes('và')) {
    errors.push('answer_error');
  }
  
  if (question.includes('なんじ') && !correctAnswer.includes('mấy giờ') && !correctAnswer.includes('何時')) {
    errors.push('answer_error');
  }
  
  if (question.includes('なんぷん') && !correctAnswer.includes('mấy phút') && !correctAnswer.includes('何分')) {
    errors.push('answer_error');
  }
  
  if (question.includes('なんようび') && !correctAnswer.includes('thứ mấy') && !correctAnswer.includes('何曜日')) {
    errors.push('answer_error');
  }
  
  if (question.includes('なんばん') && !correctAnswer.includes('số mấy') && !correctAnswer.includes('何番')) {
    errors.push('answer_error');
  }
  
  if (question.includes('げつようび') && !correctAnswer.includes('thứ hai') && !correctAnswer.includes('月曜日')) {
    errors.push('answer_error');
  }
  
  if (question.includes('かようび') && !correctAnswer.includes('thứ ba') && !correctAnswer.includes('火曜日')) {
    errors.push('answer_error');
  }
  
  if (question.includes('すいようび') && !correctAnswer.includes('thứ tư') && !correctAnswer.includes('水曜日')) {
    errors.push('answer_error');
  }
  
  if (question.includes('もくようび') && !correctAnswer.includes('thứ năm') && !correctAnswer.includes('木曜日')) {
    errors.push('answer_error');
  }
  
  if (question.includes('きんようび') && !correctAnswer.includes('thứ sáu') && !correctAnswer.includes('金曜日')) {
    errors.push('answer_error');
  }
  
  if (question.includes('どようび') && !correctAnswer.includes('thứ bảy') && !correctAnswer.includes('土曜日')) {
    errors.push('answer_error');
  }
  
  if (question.includes('にちようび') && !correctAnswer.includes('chủ nhật') && !correctAnswer.includes('日曜日')) {
    errors.push('answer_error');
  }
  
  if (question.includes('おきます') && !correctAnswer.includes('thức dậy') && !correctAnswer.includes('起きます')) {
    errors.push('answer_error');
  }
  
  if (question.includes('ねます') && !correctAnswer.includes('ngủ') && !correctAnswer.includes('寝ます')) {
    errors.push('answer_error');
  }
  
  if (question.includes('はたらきます') && !correctAnswer.includes('làm việc') && !correctAnswer.includes('働きます')) {
    errors.push('answer_error');
  }
  
  if (question.includes('おわります') && !correctAnswer.includes('kết thúc') && !correctAnswer.includes('終わります')) {
    errors.push('answer_error');
  }
  
  if (question.includes('いま') && !correctAnswer.includes('bây giờ') && !correctAnswer.includes('今')) {
    errors.push('answer_error');
  }
  
  if (question.includes('きのう') && !correctAnswer.includes('hôm qua') && !correctAnswer.includes('昨日')) {
    errors.push('answer_error');
  }
  
  if (question.includes('あした') && !correctAnswer.includes('ngày mai') && !correctAnswer.includes('明日')) {
    errors.push('answer_error');
  }
  
  if (question.includes('おととい') && !correctAnswer.includes('hôm kia') && !correctAnswer.includes('おととい')) {
    errors.push('answer_error');
  }
  
  if (question.includes('けさ') && !correctAnswer.includes('sáng nay') && !correctAnswer.includes('今朝')) {
    errors.push('answer_error');
  }
  
  if (question.includes('こんばん') && !correctAnswer.includes('tối nay') && !correctAnswer.includes('今晩')) {
    errors.push('answer_error');
  }
  
  if (question.includes('まいあさ') && !correctAnswer.includes('hàng sáng') && !correctAnswer.includes('毎朝')) {
    errors.push('answer_error');
  }
  
  if (question.includes('まいばん') && !correctAnswer.includes('hàng tối') && !correctAnswer.includes('毎晩')) {
    errors.push('answer_error');
  }
  
  if (question.includes('まいにち') && !correctAnswer.includes('hàng ngày') && !correctAnswer.includes('毎日')) {
    errors.push('answer_error');
  }
  
  if (question.includes('やすみ') && !correctAnswer.includes('nghỉ')) {
    errors.push('answer_error');
  }
  
  if (question.includes('にほんご') && !correctAnswer.includes('tiếng Nhật') && !correctAnswer.includes('日本語')) {
    errors.push('answer_error');
  }
  
  if (question.includes('えき') && !correctAnswer.includes('ga') && !correctAnswer.includes('駅')) {
    errors.push('answer_error');
  }
  
  if (question.includes('プール') && !correctAnswer.includes('bể bơi')) {
    errors.push('answer_error');
  }
  
  if (question.includes('デパート') && !correctAnswer.includes('bách hóa') && !correctAnswer.includes('デパート')) {
    errors.push('answer_error');
  }
  
  if (question.includes('ごぜん') && !correctAnswer.includes('buổi sáng') && !correctAnswer.includes('午前')) {
    errors.push('answer_error');
  }
  
  if (question.includes('ごご') && !correctAnswer.includes('buổi trưa') && !correctAnswer.includes('午後')) {
    errors.push('answer_error');
  }
  
  if (question.includes('あさ') && !correctAnswer.includes('sáng') && !correctAnswer.includes('朝')) {
    errors.push('answer_error');
  }
  
  if (question.includes('ひる') && !correctAnswer.includes('trưa') && !correctAnswer.includes('昼')) {
    errors.push('answer_error');
  }
  
  if (question.includes('ばん') && !correctAnswer.includes('tối') && !correctAnswer.includes('晩')) {
    errors.push('answer_error');
  }
  
  if (question.includes('はん') && !correctAnswer.includes('rưỡi') && !correctAnswer.includes('半')) {
    errors.push('answer_error');
  }
  
  if (question.includes('ばんごう') && !correctAnswer.includes('số') && !correctAnswer.includes('番号')) {
    errors.push('answer_error');
  }
  
  if (question.includes('べんきょう') && !correctAnswer.includes('học') && !correctAnswer.includes('勉強')) {
    errors.push('answer_error');
  }
  
  if (question.includes('こうぎ') && !correctAnswer.includes('giảng') && !correctAnswer.includes('講義')) {
    errors.push('answer_error');
  }
  
  if (question.includes('けんがく') && !correctAnswer.includes('tham quan') && !correctAnswer.includes('見学')) {
    errors.push('answer_error');
  }
  
  if (question.includes('そうですか') && !correctAnswer.includes('thế à') && !correctAnswer.includes('そうですか')) {
    errors.push('answer_error');
  }
  
  if (question.includes('たいへんですね') && !correctAnswer.includes('gay nhỉ') && !correctAnswer.includes('căng nhỉ') && !correctAnswer.includes('大変ですね')) {
    errors.push('answer_error');
  }
  
  if (question.includes('えーと') && !correctAnswer.includes('để tôi xem') && !correctAnswer.includes('えーと')) {
    errors.push('answer_error');
  }
  
  if (question.includes('ニューヨーク') && !correctAnswer.includes('New York')) {
    errors.push('answer_error');
  }
  
  if (question.includes('バンコク') && !correctAnswer.includes('Bangkok')) {
    errors.push('answer_error');
  }
  
  if (question.includes('ロサンゼルス') && !correctAnswer.includes('Los Angeles')) {
    errors.push('answer_error');
  }
  
  if (question.includes('やまとびじゅつかん') && !correctAnswer.includes('Yamato')) {
    errors.push('answer_error');
  }
  
  if (question.includes('おおさかデパート') && !correctAnswer.includes('Osaka')) {
    errors.push('answer_error');
  }
  
  if (question.includes('みどりとしょかん') && !correctAnswer.includes('Midori')) {
    errors.push('answer_error');
  }
  
  if (question.includes('ひるやすみ') && !correctAnswer.includes('nghỉ trưa') && !correctAnswer.includes('昼休み')) {
    errors.push('answer_error');
  }
  
  if (question.includes('（　）') && question.includes('どちら')) {
    const context = question.toLowerCase();
    if (context.includes('あさって') || context.includes('すいようび') || context.includes('デパート') || 
        context.includes('ぎんこう') || context.includes('プール') || context.includes('けさ') ||
        context.includes('ごぜん') || context.includes('なんじ') || context.includes('にほんご')) {
      if (quiz.correctAnswer !== 1) {
        errors.push('answer_error');
      }
    }
    if (context.includes('はたらきます') || context.includes('こんばん') || context.includes('かようび')) {
      if (quiz.correctAnswer !== 2) {
        errors.push('answer_error');
      }
    }
    if (context.includes('まいにち') || context.includes('やすみ') || context.includes('げつようび') ||
        context.includes('どようび') || context.includes('けんがく') || context.includes('ひるやすみ') ||
        context.includes('たいへんですね') || context.includes('そうですか') || context.includes('なんぷん') ||
        context.includes('ロンドン') || context.includes('にほんご')) {
      if (quiz.correctAnswer !== 0) {
        errors.push('answer_error');
      }
    }
  }
  
  if (question.includes('（　）') && question.includes('どこ')) {
    const context = question.toLowerCase();
    if (context.includes('あさって') || context.includes('すいようび') || context.includes('やすみ') ||
        context.includes('げつようび') || context.includes('どようび') || context.includes('けんがく') ||
        context.includes('ひるやすみ') || context.includes('たいへんですね') || context.includes('なんぷん') ||
        context.includes('まいばん') || context.includes('おおさかデパート') || context.includes('ゆうびんきょく')) {
      if (quiz.correctAnswer !== 2) {
        errors.push('answer_error');
      }
    }
    if (context.includes('みどりとしょかん') || context.includes('けさ') || context.includes('ひるやすみ')) {
      if (quiz.correctAnswer !== 1) {
        errors.push('answer_error');
      }
    }
    if (context.includes('やすみ') && !context.includes('ひるやすみ')) {
      if (quiz.correctAnswer !== 0) {
        errors.push('answer_error');
      }
    }
  }
  
  if (question.includes('（　）') && (question.includes('から') || question.includes('まで') || question.includes('に') || question.includes('と') || question.includes('の') || question.includes('は'))) {
    const context = question.toLowerCase();
    if (context.includes('８時') && context.includes('１０時') && context.includes('勉強')) {
      if (question.includes('(1)') && quiz.correctAnswer !== 0) {
        errors.push('answer_error');
      }
      if (question.includes('(2)') && quiz.correctAnswer !== 1) {
        errors.push('answer_error');
      }
    }
    if (context.includes('月曜日') && context.includes('木曜日') && context.includes('休み')) {
      if (question.includes('(1)') && quiz.correctAnswer !== 0) {
        errors.push('answer_error');
      }
      if (question.includes('(2)') && quiz.correctAnswer !== 1) {
        errors.push('answer_error');
      }
    }
    if (context.includes('会社') && context.includes('９時') && context.includes('５時')) {
      if (question.includes('(1)') && quiz.correctAnswer !== 0) {
        errors.push('answer_error');
      }
      if (question.includes('(2)') && quiz.correctAnswer !== 0) {
        errors.push('answer_error');
      }
      if (question.includes('(3)') && quiz.correctAnswer !== 0) {
        errors.push('answer_error');
      }
    }
    if (context.includes('９じから') && context.includes('はたらきます')) {
      if (quiz.correctAnswer !== 1) {
        errors.push('answer_error');
      }
    }
    if (context.includes('いま　なんじ') && correctAnswer.includes('に')) {
      errors.push('answer_error');
    }
    if (context.includes('けさ') && context.includes('おきました') && question.includes('(1)')) {
      if (quiz.correctAnswer !== 1) {
        errors.push('answer_error');
      }
    }
    if (context.includes('図書館') && context.includes('土曜日') && context.includes('午後') && context.includes('休み')) {
      if (quiz.correctAnswer !== 0) {
        errors.push('answer_error');
      }
    }
    if (context.includes('銀') && context.includes('行') && context.includes('３時') && context.includes('終わります')) {
      if (quiz.correctAnswer !== 0) {
        errors.push('answer_error');
      }
    }
    if (context.includes('あさって') && context.includes('日曜日')) {
      if (quiz.correctAnswer !== 0) {
        errors.push('answer_error');
      }
    }
    if (context.includes('ニューヨーク') && context.includes('今') && context.includes('午前') && context.includes('４時')) {
      if (question.includes('(1)') && quiz.correctAnswer !== 1) {
        errors.push('answer_error');
      }
      if (question.includes('(2)') && quiz.correctAnswer !== 0) {
        errors.push('answer_error');
      }
    }
    if (context.includes('毎晩') && context.includes('１１時半') && context.includes('寝ます')) {
      if (question.includes('(1)') && quiz.correctAnswer !== 0) {
        errors.push('answer_error');
      }
      if (question.includes('(2)') && quiz.correctAnswer !== 1) {
        errors.push('answer_error');
      }
    }
    if (context.includes('会社') && context.includes('から') && context.includes('まで') && question.includes('(1)')) {
      if (quiz.correctAnswer !== 0) {
        errors.push('answer_error');
      }
    }
    if (context.includes('ひるやすみ') && context.includes('１じ') && context.includes('おわります')) {
      if (quiz.correctAnswer !== 0) {
        errors.push('answer_error');
      }
    }
  }
  
  if (question.includes('（　）') && (question.includes('何時') || question.includes('何番') || question.includes('何曜日') || question.includes('何日'))) {
    const context = question.toLowerCase();
    if (context.includes('電話番号') || context.includes('でんわばんごう')) {
      if (quiz.correctAnswer !== 1) {
        errors.push('answer_error');
      }
    }
    if (context.includes('図書館') && context.includes('まで')) {
      if (quiz.correctAnswer !== 0) {
        errors.push('answer_error');
      }
    }
    if (context.includes('休み') && context.includes('大阪') && context.includes('デパート')) {
      if (quiz.correctAnswer !== 0) {
        errors.push('answer_error');
      }
    }
    if (context.includes('会社') && context.includes('から') && context.includes('まで')) {
      if (quiz.correctAnswer !== 0) {
        errors.push('answer_error');
      }
    }
  }
  
  if (question.includes('（　）') && (question.includes('おきました') || question.includes('おくます'))) {
    if (quiz.correctAnswer !== 0) {
      errors.push('answer_error');
    }
  }
  
  if (question.includes('（　）') && (question.includes('べんきょうします') || question.includes('べんきょうしました'))) {
    const context = question.toLowerCase();
    if (context.includes('こんばん') && context.includes('はい')) {
      if (quiz.correctAnswer !== 0) {
        errors.push('answer_error');
      }
    }
  }
  
  if (question.includes('（　）') && question.includes('どようび') && question.includes('にちようび')) {
    if (quiz.correctAnswer !== 0) {
      errors.push('answer_error');
    }
  }
  
  if (question.includes('（　）') && question.includes('きのう') && question.includes('はたらきました')) {
    if (quiz.correctAnswer !== 1) {
      errors.push('answer_error');
    }
  }
  
  if (question.includes('（　）') && (question.includes('これ') || question.includes('それ') || question.includes('あれ') || question.includes('どれ'))) {
    const context = question.toLowerCase();
    if (context.includes('きのう') || context.includes('おととい') || context.includes('きんようび') ||
        context.includes('すいようび') || context.includes('そうですか') || context.includes('いま') ||
        context.includes('ねます') || context.includes('たいへんですね')) {
      if (quiz.correctAnswer !== 1) {
        errors.push('answer_error');
      }
    }
  }
  
  return errors;
}

function checkLessonMismatch(quiz) {
  const errors = [];
  const question = cleanHTML(quiz.question);
  const allText = question + ' ' + quiz.options.join(' ');
  
  const japaneseWords = extractJapaneseText(allText);
  const vietnameseWords = extractVietnameseText(allText);
  
  for (const jp of japaneseWords) {
    if (jp.length > 1 && !allowedVocabulary.has(jp) && !allowedGrammarPatterns.some(p => jp.includes(p))) {
      const word = vocabularyMap.get(jp);
      if (!word) {
        errors.push('lesson_mismatch');
        break;
      }
    }
  }
  
  for (const vi of vietnameseWords) {
    if (vi.length > 2) {
      const word = Array.from(vocabularyMap.values()).find(w => w.vi && w.vi.toLowerCase() === vi);
      if (!word && !vi.match(/^(và|từ|đến|nghỉ|học|sáng|trưa|tối|bây giờ|hôm qua|hôm nay|ngày mai|ngày kia|sáng nay|tối nay|hàng sáng|hàng tối|hàng ngày|nghỉ trưa|tiếng nhật|việc học tập|bài giảng|giờ giảng|tham quan|bắc kinh|london|bangkok|los angeles|new york|bảo tàng mỹ thuật yamato|bách hóa osaka|thư viện midori|ga|bể bơi|cửa hàng bách hóa|ngân hàng|bưu điện|thư viện|bảo tàng mỹ thuật|mấy giờ|mấy phút|mấy|bao nhiêu phút|ngày thứ mấy|số mấy|thứ hai|thứ ba|thứ tư|thứ năm|thứ sáu|thứ bảy|chủ nhật|thức dậy|ngủ|làm việc|xong|kết thúc|buổi sáng|buổi trưa|nửa|rưỡi|hôm kia|số|thế à|gay nhỉ|căng nhỉ|để tôi xem)$/i)) {
        errors.push('lesson_mismatch');
        break;
      }
    }
  }
  
  return errors;
}

function suggestFix(quiz, errors) {
  if (errors.length === 0) {
    return null;
  }
  
  const fix = {
    question: quiz.question,
    options: [...quiz.options],
    correctAnswer: quiz.correctAnswer
  };
  
  if (errors.includes('technical_error')) {
    if (!fix.options || fix.options.length < 2) {
      fix.options = ['Option 1', 'Option 2'];
    }
    if (fix.correctAnswer < 0 || fix.correctAnswer >= fix.options.length) {
      fix.correctAnswer = 0;
    }
  }
  
  if (errors.includes('answer_error')) {
    const question = cleanHTML(quiz.question);
    if (question.includes('あさって') && !fix.options[fix.correctAnswer].includes('ngày kia')) {
      const correctIdx = fix.options.findIndex(opt => opt.includes('ngày kia'));
      if (correctIdx !== -1) {
        fix.correctAnswer = correctIdx;
      }
    }
    if (question.includes('やすみます') && !fix.options[fix.correctAnswer].includes('nghỉ')) {
      const correctIdx = fix.options.findIndex(opt => opt.includes('nghỉ'));
      if (correctIdx !== -1) {
        fix.correctAnswer = correctIdx;
      }
    }
    if (question.includes('べんきょう') && !fix.options[fix.correctAnswer].includes('học')) {
      const correctIdx = fix.options.findIndex(opt => opt.includes('học'));
      if (correctIdx !== -1) {
        fix.correctAnswer = correctIdx;
      }
    }
  }
  
  return fix;
}

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
  const technicalErrors = checkTechnicalErrors(quiz, quizData);
  const answerErrors = checkAnswerCorrectness(quiz);
  const lessonMismatches = checkLessonMismatch(quiz);
  
  const allErrors = [...new Set([...technicalErrors, ...answerErrors, ...lessonMismatches])];
  
  if (technicalErrors.length > 0) results.summary.technical_errors++;
  if (answerErrors.length > 0) results.summary.answer_errors++;
  if (lessonMismatches.length > 0) results.summary.lesson_mismatches++;
  
  const status = allErrors.length === 0 ? 'PASS' : 'FAIL';
  const explanation = allErrors.length === 0 
    ? 'Không có lỗi'
    : allErrors.join(', ');
  
  const suggestedFix = suggestFix(quiz, allErrors);
  
  results.details.push({
    id: quiz.id,
    status,
    errors: allErrors,
    explanation,
    suggested_fix: suggestedFix
  });
});

const output = JSON.stringify(results, null, 2);
const outputFile = path.join(__dirname, '..', 'quiz4_analysis_result.json');
fs.writeFileSync(outputFile, output, 'utf8');
console.log(output);
