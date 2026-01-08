const fs = require('fs');
const path = require('path');

function readJSONFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content.replace(/^\uFEFF/, ''));
}

const QUIZ_FILE = path.join(__dirname, '..', 'data', 'quiz', 'quiz2.json');
const LESSON_FILE = path.join(__dirname, '..', 'data', 'lesson', 'lesson2.json');
const GRAMMAR_FILE = path.join(__dirname, '..', 'data', 'grammar', 'grammar2.json');

const quiz = readJSONFile(QUIZ_FILE);
const lesson = readJSONFile(LESSON_FILE);
const grammar = readJSONFile(GRAMMAR_FILE);

const lessonVocabSet = new Set();
const lessonReadingsSet = new Set();
const lessonKanjiSet = new Set();

lesson.forEach(item => {
  if (item.hiragana) {
    const clean = item.hiragana.replace(/[～\s]/g, '');
    if (clean) lessonReadingsSet.add(clean);
  }
  if (item.kanji) {
    const clean = item.kanji.replace(/[～\s]/g, '');
    if (clean) lessonKanjiSet.add(clean);
  }
});

const allowedWords = new Set([
  'これ', 'それ', 'あれ', 'この', 'その', 'あの',
  'どれ', 'どの', 'だれの', 'なんの', 'なん', 'だれ',
  'の', 'は', 'も', 'から', 'か', 'です', 'ですか', 'じゃ', 'ありません',
  'そう', 'そうですか', 'そうではありません',
  'ペン', 'やまだ', 'たなか', 'ラオ', 'タン', 'ミラー', 'ワン', 'リン', 'すずき', 'さとう'
]);

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

function cleanText(text) {
  return text.replace(/<[^>]*>/g, '').replace(/<ruby>.*?<\/ruby>/g, '').trim();
}

function extractJapanese(text) {
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g;
  return text.match(japaneseRegex) || [];
}

function isInLesson2(word) {
  const clean = word.replace(/[～\s]/g, '');
  
  if (allowedWords.has(clean)) return true;
  if (lessonReadingsSet.has(clean)) return true;
  if (lessonKanjiSet.has(clean)) return true;
  
  for (const item of lesson) {
    if (item.hiragana && clean.includes(item.hiragana.replace(/[～\s]/g, ''))) return true;
    if (item.kanji && clean.includes(item.kanji.replace(/[～\s]/g, ''))) return true;
  }
  
  return false;
}

function checkLessonAlignment(question, options) {
  const allText = question + ' ' + options.join(' ');
  const japaneseWords = extractJapanese(allText);
  const issues = [];
  
  for (const word of japaneseWords) {
    const clean = word.replace(/[～\s]/g, '');
    if (clean.length === 0) continue;
    
    if (!isInLesson2(clean)) {
      if (!['コンピュータ', 'コンピューター', 'コンビュータ', 'コンビューター', 'かりな', 'カリナ'].includes(clean)) {
        issues.push(clean);
      }
    }
  }
  
  if (allText.includes('コンピュータ') || allText.includes('コンピューター') || 
      allText.includes('コンビュータ') || allText.includes('コンビューター')) {
    issues.push('コンピュータ/コンピューター (vượt bài, không có trong bài 2)');
  }
  
  if (allText.includes('かりな') || allText.includes('カリナ')) {
    issues.push('カリナ (tên riêng không có trong bài 2)');
  }
  
  return issues.length > 0 ? issues : null;
}

function checkAnswerCorrectness(item) {
  const { question, options, correctAnswer } = item;
  const cleanQ = cleanText(question);
  const correctOpt = options[correctAnswer];
  const errors = [];
  
  const specificChecks = {
    4: () => {
      if (cleanQ.includes('これは　なんですか') && cleanQ.includes('B：（　）です')) {
        if (correctOpt === 'はい、ほんです') {
          errors.push('Sai: Câu hỏi なんですか không dùng はい, chỉ trả lời trực tiếp');
        }
      }
    },
    8: () => {
      if (cleanQ.includes('これは　ほんですか、ざっしですか')) {
        if (correctOpt === 'はい、ざっしです') {
          errors.push('Sai: Câu hỏi lựa chọn (N1ですか、N2ですか) không dùng はい, chỉ trả lời trực tiếp');
        }
      }
    },
    35: () => {
      if (cleanQ === 'これ') {
        if (correctOpt === 'Cái kia (xa cả hai)' || correctOpt === 'Cái kia') {
          errors.push('Sai: これ = cái này (gần người nói), không phải cái kia');
        }
      }
    },
    36: () => {
      if (cleanQ === 'それ') {
        if (correctOpt === 'Cái kia' || correctOpt === 'Cái này') {
          errors.push('Sai: それ = cái đó (gần người nghe), không phải cái kia hay cái này');
        }
      }
    },
    40: () => {
      if (cleanQ === 'カメラ') {
        if (correctOpt === 'Máy in') {
          errors.push('Sai: カメラ = máy ảnh, không phải máy in');
        }
      }
    },
    44: () => {
      if (cleanQ === 'その') {
        if (correctOpt === 'Cái kia (đứng trước danh từ, xa cả hai)') {
          errors.push('Sai: その = cái đó (đứng trước danh từ, gần người nghe), không phải cái kia');
        }
      }
    },
    46: () => {
      if (cleanQ === 'ほん') {
        if (correctOpt === 'Bút') {
          errors.push('Sai: ほん = sách, không phải bút');
        }
      }
    },
    49: () => {
      if (cleanQ === 'それ') {
        if (correctOpt === 'Cái kia (xa cả hai)') {
          errors.push('Sai: それ = cái đó (gần người nghe), không phải cái kia');
        }
      }
    },
    53: () => {
      if (cleanQ === 'その') {
        if (correctOpt === 'Cái này (đứng một mình)') {
          errors.push('Sai: その = cái đó (đứng trước danh từ), không phải cái này và không đứng một mình');
        }
      }
    },
    60: () => {
      if (cleanQ.includes('これは　なんですか') && cleanQ.includes('B：（　）。')) {
        if (correctOpt === 'はい、ほんです') {
          errors.push('Sai: Câu hỏi なんですか không dùng はい, chỉ trả lời trực tiếp');
        }
      }
    },
    62: () => {
      if (cleanQ === 'そう') {
        if (correctOpt === 'Có thể' || correctOpt === 'Không biết' || correctOpt === 'Không phải') {
          errors.push('Sai: そう = đúng vậy (dùng để xác nhận)');
        }
      }
    },
    70: () => {
      if (cleanQ === 'どの') {
        if (correctOpt === 'Cái gì' || correctOpt === 'Của ai') {
          errors.push('Sai: どの = cái nào (đứng trước danh từ), không phải cái gì hay của ai');
        }
      }
    },
    74: () => {
      if (cleanQ === 'それ') {
        if (correctOpt === 'Cái này (đứng một mình)') {
          errors.push('Sai: それ = cái đó (đứng một mình, gần người nghe), không phải cái này');
        }
      }
    },
    78: () => {
      if (cleanQ === 'ラジオ') {
        if (correctOpt === 'Máy tính') {
          errors.push('Sai: ラジオ = radio, không phải máy tính');
        }
      }
    },
    84: () => {
      if (cleanQ === 'えんぴつ') {
        if (correctOpt === 'Bút') {
          errors.push('Sai: えんぴつ = bút chì, không phải bút (chung chung)');
        }
      }
    },
    86: () => {
      if (cleanQ === 'Bút') {
        if (correctOpt === 'えんぴつ') {
          errors.push('Sai: Bút (chung) = ペン, không phải えんぴつ (bút chì)');
        }
      }
    },
    87: () => {
      if (cleanQ === 'ノート') {
        if (correctOpt === 'Bút') {
          errors.push('Sai: ノート = vở, không phải bút');
        }
      }
    },
    98: () => {
      if (cleanQ === 'かさ' && options.includes('傘')) {
        if (correctOpt !== '傘') {
          errors.push('Sai: かさ = 傘 (cái ô)');
        }
      }
    },
    101: () => {
      if (cleanQ === 'かばん') {
        if (correctOpt === 'Đồng hồ') {
          errors.push('Sai: かばん = cặp sách, không phải đồng hồ');
        }
      }
    },
    59: () => {
      if (cleanQ.includes('時計')) {
        if (correctOpt === '当計') {
          errors.push('Sai: とけい = 時計 (đồng hồ), không phải 当計');
        }
      }
    }
  };
  
  if (specificChecks[item.id]) {
    specificChecks[item.id]();
  }
  
  return errors.length > 0 ? errors : null;
}

quiz.forEach((item) => {
  const errors = [];
  let explanation = '';
  
  if (!item.id || item.id === null || item.id === undefined) {
    errors.push('technical_error');
    explanation += 'Thiếu id. ';
  } else if (seenIds.has(item.id)) {
    errors.push('technical_error');
    explanation += `ID ${item.id} bị trùng. `;
  } else {
    seenIds.add(item.id);
  }
  
  if (!item.question || item.question.trim() === '') {
    errors.push('technical_error');
    explanation += 'Question rỗng. ';
  } else {
    const cleanQ = cleanText(item.question);
    if (seenQuestions.has(cleanQ)) {
      errors.push('technical_error');
      explanation += 'Câu hỏi trùng nội dung. ';
    } else {
      seenQuestions.add(cleanQ);
    }
  }
  
  if (!item.options || !Array.isArray(item.options) || item.options.length < 2) {
    errors.push('technical_error');
    explanation += 'Options phải là mảng ≥ 2 phần tử. ';
  } else {
    const uniqueOptions = new Set(item.options);
    if (uniqueOptions.size !== item.options.length) {
      errors.push('technical_error');
      explanation += 'Options có phần tử trùng. ';
    }
  }
  
  if (item.correctAnswer === null || item.correctAnswer === undefined || 
      !Number.isInteger(item.correctAnswer) || 
      item.correctAnswer < 0 || 
      (item.options && item.correctAnswer >= item.options.length)) {
    errors.push('technical_error');
    explanation += 'correctAnswer không hợp lệ. ';
  }
  
  if (!item.difficulty || !Number.isInteger(item.difficulty) || item.difficulty <= 0) {
    errors.push('technical_error');
    explanation += 'difficulty phải là số nguyên dương. ';
  }
  
  const answerErrors = checkAnswerCorrectness(item);
  if (answerErrors) {
    errors.push('answer_error');
    explanation += answerErrors.join(' ');
  }
  
  const lessonIssues = checkLessonAlignment(item.question, item.options || []);
  if (lessonIssues) {
    errors.push('lesson_mismatch');
    explanation += `Vượt bài: ${lessonIssues.join(', ')}. `;
  }
  
  if (errors.length > 0) {
    results.summary.technical_errors += errors.filter(e => e === 'technical_error').length;
    results.summary.answer_errors += errors.filter(e => e === 'answer_error').length;
    results.summary.lesson_mismatches += errors.filter(e => e === 'lesson_mismatch').length;
  }
  
  const detail = {
    id: item.id,
    status: errors.length === 0 ? 'PASS' : 'FAIL',
    errors: errors,
    explanation: explanation.trim() || 'Không có lỗi'
  };
  
  if (errors.length > 0) {
    detail.suggested_fix = {
      question: item.question,
      options: item.options,
      correctAnswer: item.correctAnswer
    };
    
    const fixes = {
      4: 1, 8: 0, 35: 2, 36: 3, 40: 3, 44: 3, 46: 2, 49: 3, 53: 3,
      60: 1, 62: 3, 70: 2, 74: 2, 78: 1, 84: 1, 86: 3, 87: 3, 98: 0, 101: 0, 59: 1
    };
    
    if (fixes[item.id] !== undefined) {
      detail.suggested_fix.correctAnswer = fixes[item.id];
    }
  }
  
  results.details.push(detail);
});

console.log(JSON.stringify(results, null, 2));
