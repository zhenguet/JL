const fs = require('fs');
const path = require('path');

const quizPath = path.join(__dirname, '..', 'data', 'quiz', 'quiz3.json');
const lessonPath = path.join(__dirname, '..', 'data', 'lesson', 'lesson3.json');
const grammarPath = path.join(__dirname, '..', 'data', 'grammar', 'grammar3.json');

const quiz = JSON.parse(fs.readFileSync(quizPath, 'utf8').replace(/^\uFEFF/, ''));
const lesson = JSON.parse(fs.readFileSync(lessonPath, 'utf8').replace(/^\uFEFF/, ''));
const grammar = JSON.parse(fs.readFileSync(grammarPath, 'utf8').replace(/^\uFEFF/, ''));

const lessonVocab = new Set();
const lessonVocabHiragana = new Set();
const lessonVocabKanji = new Set();
const lessonVocabVi = new Set();

lesson.forEach(item => {
  if (item.hiragana) lessonVocabHiragana.add(item.hiragana);
  if (item.kanji) lessonVocabKanji.add(item.kanji);
  if (item.vi) lessonVocabVi.add(item.vi.toLowerCase());
  lessonVocab.add(item.hiragana);
  if (item.kanji) lessonVocab.add(item.kanji);
});

const grammarPatterns = [];
grammar.forEach(g => {
  grammarPatterns.push(g.structure);
  g.examples.forEach(ex => {
    grammarPatterns.push(ex.japanese);
  });
});

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

function extractHiragana(text) {
  if (!text) return [];
  const hiragana = [];
  const hiraganaRegex = /[\u3040-\u309F]+/g;
  let match;
  while ((match = hiraganaRegex.exec(text)) !== null) {
    hiragana.push(match[0]);
  }
  return hiragana;
}

function extractKanji(text) {
  if (!text) return [];
  const kanji = [];
  const kanjiRegex = /[\u4E00-\u9FAF]+/g;
  let match;
  while ((match = kanjiRegex.exec(text)) !== null) {
    kanji.push(match[0]);
  }
  return kanji;
}

function isInLesson3(text) {
  if (!text) return { inLesson: true, violations: [] };
  
  const violations = [];
  const japanese = extractJapaneseText(text);
  const hiragana = extractHiragana(text);
  const kanji = extractKanji(text);
  
  japanese.forEach(word => {
    if (!lessonVocab.has(word)) {
      const isHiragana = /^[\u3040-\u309F]+$/.test(word);
      const isKanji = /^[\u4E00-\u9FAF]+$/.test(word);
      
      if (isHiragana && !lessonVocabHiragana.has(word)) {
        violations.push({ type: 'hiragana', word, reason: 'not_in_lesson3' });
      } else if (isKanji && !lessonVocabKanji.has(word)) {
        violations.push({ type: 'kanji', word, reason: 'not_in_lesson3' });
      } else if (!isHiragana && !isKanji) {
        const parts = word.split('');
        parts.forEach(part => {
          if (/[\u3040-\u309F]/.test(part) && !lessonVocabHiragana.has(part)) {
            violations.push({ type: 'hiragana', word: part, reason: 'not_in_lesson3' });
          }
          if (/[\u4E00-\u9FAF]/.test(part) && !lessonVocabKanji.has(part)) {
            violations.push({ type: 'kanji', word: part, reason: 'not_in_lesson3' });
          }
        });
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
  
  if (qText.includes('食堂') || qText.includes('しょくどう')) {
    if (qText.includes('食堂') && !correctOption.includes('しょくどう')) {
      errors.push('Đáp án sai: 食堂 phải đọc là しょくどう');
    }
    if (qText.includes('しょくどう') && !correctOption.includes('nhà ăn') && !correctOption.includes('phòng ăn')) {
      errors.push('Đáp án sai: しょくどう phải là nhà ăn/phòng ăn');
    }
  }
  
  if (qText.includes('階段') || qText.includes('かいだん')) {
    if (qText.includes('階段') && !correctOption.includes('かいだん')) {
      errors.push('Đáp án sai: 階段 phải đọc là かいだん');
    }
    if (qText.includes('かいだん') && !correctOption.includes('cầu thang')) {
      errors.push('Đáp án sai: かいだん phải là cầu thang');
    }
  }
  
  if (qText.includes('どちら')) {
    if (qText.includes('どちら') && !correctOption.includes('ở đâu') && !correctOption.includes('Cái gì') && !correctOption.includes('Cái nào')) {
      const context = qText.toLowerCase();
      if (context.includes('どこ') || context.includes('nơi') || context.includes('chỗ')) {
        if (!correctOption.includes('ở đâu')) {
          errors.push('Đáp án sai: どちら (hỏi nơi chốn) phải là "ở đâu"');
        }
      }
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
  
  if (qText.includes('いくら')) {
    if (!correctOption.includes('bao nhiêu tiền')) {
      errors.push('Đáp án sai: いくら phải là "bao nhiêu tiền"');
    }
  }
  
  if (qText.includes('から') && qText.includes('の')) {
    const hasKara = qText.includes('から');
    const hasNo = qText.includes('の');
    if (hasKara && hasNo) {
      const context = qText.toLowerCase();
      if (context.includes('どこ') && context.includes('時計') || context.includes('どこ') && context.includes('とけい')) {
        if (correctAnswer === 0 && !correctOption.includes('から')) {
          errors.push('Đáp án sai: "どこ" + "時計" cần dùng "から" (xuất xứ)');
        }
      }
    }
  }
  
  if (qText.includes('どこ') && qText.includes('の')) {
    const context = qText.toLowerCase();
    if (context.includes('コーヒー') || context.includes('ネクタイ')) {
      if (!correctOption.includes('どこ')) {
        errors.push('Đáp án sai: hỏi xuất xứ phải dùng "どこ"');
      }
    }
  }
  
  if (qText.includes('なん') && qText.includes('の')) {
    const context = qText.toLowerCase();
    if (context.includes('会社') || context.includes('かいしゃ')) {
      if (!correctOption.includes('なん') && !correctOption.includes('何')) {
        errors.push('Đáp án sai: hỏi loại hình công ty phải dùng "なん"');
      }
    }
  }
  
  if (qText.includes('おくに') || qText.includes('お国')) {
    if (qText.includes('おくに') && !correctOption.includes('nước') && !correctOption.includes('quốc gia')) {
      errors.push('Đáp án sai: おくに phải là nước/quốc gia');
    }
  }
  
  if (qText.includes('へや') || qText.includes('部屋')) {
    if (qText.includes('へや') && !correctOption.includes('Phòng') && !correctOption.includes('phòng')) {
      errors.push('Đáp án sai: へや phải là phòng');
    }
  }
  
  if (qText.includes('にわ') || qText.includes('庭')) {
    if (qText.includes('にわ') && !correctOption.includes('Sân') && !correctOption.includes('sân') && !correctOption.includes('Vườn')) {
      errors.push('Đáp án sai: にわ phải là sân/vườn');
    }
  }
  
  if (qText.includes('うち') || qText.includes('家')) {
    if (qText.includes('うち') && !correctOption.includes('Nhà') && !correctOption.includes('nhà')) {
      errors.push('Đáp án sai: うち phải là nhà');
    }
  }
  
  if (qText.includes('くつ') || qText.includes('靴')) {
    if (qText.includes('くつ') && !correctOption.includes('giầy') && !correctOption.includes('Giầy')) {
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
    if (qText.includes('せん') && !correctOption.includes('nghìn') && !correctOption.includes('Nghìn')) {
      errors.push('Đáp án sai: せん phải là nghìn');
    }
  }
  
  if (qText.includes('ひゃく') || qText.includes('百')) {
    if (qText.includes('ひゃく') && !correctOption.includes('trăm') && !correctOption.includes('Trăm')) {
      errors.push('Đáp án sai: ひゃく phải là trăm');
    }
  }
  
  if (qText.includes('まん') || qText.includes('万')) {
    if (qText.includes('まん') && !correctOption.includes('vạn') && !correctOption.includes('mười nghìn')) {
      errors.push('Đáp án sai: まん phải là vạn/mười nghìn');
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

quiz.forEach((item, index) => {
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
  
  const questionCheck = isInLesson3(item.question);
  const optionsCheck = item.options.map(opt => isInLesson3(opt));
  
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
        violations.push(...questionCheck.violations.map(v => `${v.word} (${v.type})`));
      }
      optionsCheck.forEach((check, idx) => {
        if (!check.inLesson) {
          violations.push(...check.violations.map(v => `option[${idx}]: ${v.word} (${v.type})`));
        }
      });
      explanations.push(`Vượt phạm vi bài 3: ${violations.join(', ')}`);
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
console.log(`Analysis complete. Results saved to ${outputPath}`);
