const fs = require('fs');
const path = require('path');

const QUIZ_FILE = path.join(__dirname, '..', 'data', 'quiz', 'quiz2.json');
const LESSON_FILE = path.join(__dirname, '..', 'data', 'lesson', 'lesson2.json');
const GRAMMAR_FILE = path.join(__dirname, '..', 'data', 'grammar', 'grammar2.json');

const quiz = JSON.parse(fs.readFileSync(QUIZ_FILE, 'utf8'));
const lesson = JSON.parse(fs.readFileSync(LESSON_FILE, 'utf8'));
const grammar = JSON.parse(fs.readFileSync(GRAMMAR_FILE, 'utf8'));

const lessonVocab = new Set();
const lessonReadings = new Set();
const lessonKanji = new Set();

lesson.forEach(item => {
  if (item.hiragana) lessonReadings.add(item.hiragana);
  if (item.kanji) {
    const kanjiOnly = item.kanji.replace(/[～\s]/g, '');
    if (kanjiOnly) lessonKanji.add(kanjiOnly);
  }
  if (item.id) lessonVocab.add(item.id);
});

const grammarPatterns = grammar.map(g => g.id);

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

function checkLessonAlignment(question, options) {
  const allText = question + ' ' + options.join(' ');
  const japaneseWords = extractJapanese(allText);
  
  const issues = [];
  
  for (const word of japaneseWords) {
    const cleanWord = word.replace(/[～\s]/g, '');
    
    let found = false;
    
    for (const item of lesson) {
      if (item.hiragana && cleanWord.includes(item.hiragana.replace(/[～\s]/g, ''))) {
        found = true;
        break;
      }
      if (item.kanji) {
        const kanjiOnly = item.kanji.replace(/[～\s]/g, '');
        if (cleanWord.includes(kanjiOnly) && kanjiOnly) {
          found = true;
          break;
        }
      }
    }
    
    if (!found && cleanWord.length > 0) {
      if (['どれ', 'どの', 'だれの', 'なんの'].includes(cleanWord)) {
        found = true;
      }
      if (['ペン'].includes(cleanWord)) {
        found = true;
      }
    }
    
    if (!found && cleanWord.length > 0 && !['の', 'は', 'も', 'から', 'か', 'です', 'ですか', 'じゃ', 'ありません'].includes(cleanWord)) {
      issues.push(cleanWord);
    }
  }
  
  return issues.length > 0 ? issues : null;
}

function checkAnswerCorrectness(item) {
  const { question, options, correctAnswer } = item;
  const cleanQ = cleanText(question);
  const correctOpt = options[correctAnswer];
  
  const errors = [];
  
  if (cleanQ.includes('あれは　たなかさん（　）かばんです')) {
    if (correctOpt !== 'の') {
      errors.push('Sai: Phải là の (sở hữu)');
    }
  }
  
  if (cleanQ.includes('どの　ペンが　あなたのですか')) {
    if (correctOpt !== 'その') {
      errors.push('Sai: Phải trả lời bằng その (đứng trước danh từ)');
    }
  }
  
  if (cleanQ.includes('これは　なんですか') && !cleanQ.includes('B：')) {
    if (correctOpt === 'はい、ほんです') {
      errors.push('Sai: Câu hỏi なんですか không dùng はい, chỉ trả lời trực tiếp');
    }
  }
  
  if (cleanQ.includes('あれは　なんですか') && cleanQ.includes('B：（　）は　かばんです')) {
    if (correctOpt !== 'それ') {
      errors.push('Sai: Khi người nói hỏi あれ, người nghe trả lời bằng それ');
    }
  }
  
  if (cleanQ.includes('あれは（　）かばんですか') && cleanQ.includes('B：たなかさんのです')) {
    if (correctOpt !== 'だれの') {
      errors.push('Sai: Hỏi về sở hữu phải dùng だれの');
    }
  }
  
  if (cleanQ.includes('これは　ほんですか、ざっしですか')) {
    if (correctOpt === 'はい、ざっしです') {
      errors.push('Sai: Câu hỏi lựa chọn không dùng はい, chỉ trả lời trực tiếp');
    }
  }
  
  if (cleanQ.includes('どの　かばんが　あなたのですか')) {
    if (correctOpt !== 'あの') {
      errors.push('Sai: Phải trả lời bằng あの (đứng trước danh từ)');
    }
  }
  
  if (cleanQ.includes('あの　かばんは　たなかさん（　）です')) {
    if (correctOpt !== 'の') {
      errors.push('Sai: Phải là の (sở hữu, N2 được lược bỏ)');
    }
  }
  
  if (cleanQ.includes('それは　だれの　カメラですか') && cleanQ.includes('B：（　）です')) {
    if (correctOpt !== 'わたしの') {
      errors.push('Sai: Phải trả lời đầy đủ わたしの (không được lược bỏ khi hỏi về sở hữu)');
    }
  }
  
  if (cleanQ.includes('これは　わたし（　）ノートです')) {
    if (correctOpt !== 'の') {
      errors.push('Sai: Phải là の (sở hữu)');
    }
  }
  
  if (cleanQ.includes('この　ノートは　わたし（　）です')) {
    if (correctOpt !== 'の') {
      errors.push('Sai: Phải là の (sở hữu, N2 được lược bỏ)');
    }
  }
  
  if (cleanQ.includes('その　ペンは　やまださん（　）です')) {
    if (correctOpt !== 'の') {
      errors.push('Sai: Phải là の (sở hữu, N2 được lược bỏ)');
    }
  }
  
  if (cleanQ.includes('それは　なんですか') && cleanQ.includes('B：（　）は　かぎです')) {
    if (correctOpt !== 'それ') {
      errors.push('Sai: Khi người nói hỏi それ, người nghe trả lời bằng それ');
    }
  }
  
  if (cleanQ.includes('これ')) {
    const qClean = cleanQ.replace(/[これそれあれどれこのそのあのどの]/g, '');
    if (qClean.includes('Cái này (gần người nói)') && correctOpt !== 'Cái này (gần người nói)') {
      if (cleanQ.includes('これ') && !cleanQ.includes('この')) {
        if (correctOpt !== 'Cái này (gần người nói)') {
          errors.push('Sai: これ = cái này (gần người nói)');
        }
      }
    }
  }
  
  if (cleanQ.includes('それ')) {
    if (cleanQ.includes('Cái đó') && !cleanQ.includes('Cái kia')) {
      if (correctOpt !== 'Cái đó' && correctOpt !== 'Cái đó (gần người nghe)') {
        errors.push('Sai: それ = cái đó (gần người nghe)');
      }
    }
  }
  
  if (cleanQ.includes('あれ')) {
    if (cleanQ.includes('Cái kia') && correctOpt !== 'Cái kia' && !correctOpt.includes('Cái kia')) {
      errors.push('Sai: あれ = cái kia (xa cả hai)');
    }
  }
  
  if (cleanQ.includes('この')) {
    if (correctOpt !== 'Cái này (đứng trước danh từ, gần người nói)' && correctOpt !== 'Cái này (đứng trước danh từ)') {
      if (cleanQ.includes('この') && !cleanQ.includes('これ')) {
        errors.push('Sai: この = cái này (đứng trước danh từ)');
      }
    }
  }
  
  if (cleanQ.includes('その')) {
    if (correctOpt !== 'Cái đó (đứng trước danh từ, gần người nghe)' && correctOpt !== 'Cái đó (đứng trước danh từ)') {
      if (cleanQ.includes('その') && !cleanQ.includes('それ')) {
        errors.push('Sai: その = cái đó (đứng trước danh từ)');
      }
    }
  }
  
  if (cleanQ.includes('あの')) {
    if (correctOpt !== 'Cái kia (đứng trước danh từ, xa cả hai)' && correctOpt !== 'Cái kia (đứng trước danh từ)') {
      if (cleanQ.includes('あの') && !cleanQ.includes('あれ')) {
        errors.push('Sai: あの = cái kia (đứng trước danh từ)');
      }
    }
  }
  
  if (cleanQ.includes('どれ')) {
    if (correctOpt !== 'Cái nào (trong số nhiều)' && !correctOpt.includes('Cái nào')) {
      errors.push('Sai: どれ = cái nào (trong số nhiều, đứng một mình)');
    }
  }
  
  if (cleanQ.includes('どの')) {
    if (correctOpt !== 'Cái nào (đứng trước danh từ)' && !correctOpt.includes('Cái nào')) {
      errors.push('Sai: どの = cái nào (đứng trước danh từ)');
    }
  }
  
  if (cleanQ.includes('だれの')) {
    if (correctOpt !== 'Của ai') {
      errors.push('Sai: だれの = của ai');
    }
  }
  
  if (cleanQ.includes('なんの')) {
    if (correctOpt !== 'Của cái gì') {
      errors.push('Sai: なんの = của cái gì');
    }
  }
  
  if (cleanQ.includes('そう')) {
    if (correctOpt !== 'Đúng vậy') {
      errors.push('Sai: そう = đúng vậy');
    }
  }
  
  if (cleanQ.includes('かさ') && cleanQ.includes('傘')) {
    if (correctOpt !== '傘') {
      errors.push('Sai: かさ = 傘 (cái ô)');
    }
  }
  
  if (cleanQ.includes('かばん') && cleanQ.includes('Cặp sách')) {
    if (correctOpt !== 'Cặp sách') {
      errors.push('Sai: かばん = cặp sách');
    }
  }
  
  if (cleanQ.includes('ほん') && cleanQ.includes('Sách')) {
    if (correctOpt !== 'Sách') {
      errors.push('Sai: ほん = sách');
    }
  }
  
  if (cleanQ.includes('とけい') && cleanQ.includes('時計')) {
    if (correctOpt !== '時計') {
      errors.push('Sai: とけい = 時計 (đồng hồ)');
    }
  }
  
  if (cleanQ.includes('コンピュータ') || cleanQ.includes('コンピューター')) {
    errors.push('Vượt bài: コンピュータ/コンピューター không có trong bài 2');
  }
  
  if (cleanQ.includes('かりなさん') || cleanQ.includes('カリナさん')) {
    errors.push('Vượt bài: Tên riêng không có trong bài 2');
  }
  
  return errors.length > 0 ? errors : null;
}

quiz.forEach((item, index) => {
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
    explanation += `Vượt bài: ${lessonIssues.join(', ')} không có trong bài 2. `;
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
    
    if (answerErrors) {
      if (item.id === 4) {
        detail.suggested_fix.correctAnswer = 1;
      } else if (item.id === 8) {
        detail.suggested_fix.correctAnswer = 0;
      } else if (item.id === 35) {
        detail.suggested_fix.correctAnswer = 2;
      } else if (item.id === 36) {
        detail.suggested_fix.correctAnswer = 3;
      } else if (item.id === 40) {
        detail.suggested_fix.correctAnswer = 3;
      } else if (item.id === 44) {
        detail.suggested_fix.correctAnswer = 3;
      } else if (item.id === 46) {
        detail.suggested_fix.correctAnswer = 2;
      } else if (item.id === 49) {
        detail.suggested_fix.correctAnswer = 3;
      } else if (item.id === 53) {
        detail.suggested_fix.correctAnswer = 3;
      } else if (item.id === 60) {
        detail.suggested_fix.correctAnswer = 1;
      } else if (item.id === 62) {
        detail.suggested_fix.correctAnswer = 3;
      } else if (item.id === 70) {
        detail.suggested_fix.correctAnswer = 2;
      } else if (item.id === 74) {
        detail.suggested_fix.correctAnswer = 2;
      } else if (item.id === 78) {
        detail.suggested_fix.correctAnswer = 1;
      } else if (item.id === 84) {
        detail.suggested_fix.correctAnswer = 1;
      } else if (item.id === 86) {
        detail.suggested_fix.correctAnswer = 3;
      } else if (item.id === 87) {
        detail.suggested_fix.correctAnswer = 3;
      } else if (item.id === 98) {
        detail.suggested_fix.correctAnswer = 0;
      } else if (item.id === 101) {
        detail.suggested_fix.correctAnswer = 0;
      } else if (item.id === 59) {
        detail.suggested_fix.correctAnswer = 3;
      }
    }
  }
  
  results.details.push(detail);
});

console.log(JSON.stringify(results, null, 2));
