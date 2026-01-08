const fs = require('fs');
const path = require('path');

const quizPath = path.join(__dirname, '..', 'data', 'quiz', 'quiz3.json');
const analysisPath = path.join(__dirname, '..', 'quiz3_analysis.json');
const lessonPath = path.join(__dirname, '..', 'data', 'lesson', 'lesson3.json');

const quiz = JSON.parse(fs.readFileSync(quizPath, 'utf8').replace(/^\uFEFF/, ''));
const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8').replace(/^\uFEFF/, ''));
const lesson = JSON.parse(fs.readFileSync(lessonPath, 'utf8').replace(/^\uFEFF/, ''));

const lessonVocab = new Set();
lesson.forEach(item => {
  if (item.hiragana) lessonVocab.add(item.hiragana);
  if (item.kanji) lessonVocab.add(item.kanji);
  if (item.id === 'floor') lessonVocab.add('～かい');
  if (item.id === 'yen') lessonVocab.add('～えん');
});

const basicGrammarParticles = new Set([
  'は', 'が', 'を', 'に', 'で', 'から', 'まで', 'の', 'も', 'と', 'や', 'か',
  'です', 'ですか', 'でした', 'でしたか', 'ます', 'ません', 'ました', 'ませんでした',
  'これ', 'それ', 'あれ', 'どれ', 'この', 'その', 'あの', 'どの',
  'ここ', 'そこ', 'あそこ', 'どこ', 'こちら', 'そちら', 'あちら', 'どちら',
  'なん', 'なに', 'いくら', 'いくつ', 'だれ', 'いつ'
]);

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

function isWordInLesson3(word) {
  if (word.includes('～')) {
    const base = word.replace('～', '');
    return lessonVocab.has(base) || basicGrammarParticles.has(base);
  }
  return lessonVocab.has(word) || basicGrammarParticles.has(word);
}

function hasVocabularyOutsideLesson3(text) {
  if (!text) return false;
  const words = extractVocabularyWords(text);
  return words.some(word => !isWordInLesson3(word));
}

function fixQuizItem(originalItem, analysisDetail) {
  let fixed = JSON.parse(JSON.stringify(originalItem));
  const errors = analysisDetail.errors || [];
  
  if (errors.length === 0) {
    return fixed;
  }
  
  if (errors.includes('answer_error')) {
    const explanation = analysisDetail.explanation || '';
    
    const answerFixes = {
      'せん phải là nghìn': (opt) => opt.toLowerCase().includes('nghìn') || opt.toLowerCase().includes('nghin'),
      'いくら phải là "bao nhiêu tiền"': (opt) => opt.toLowerCase().includes('bao nhiêu tiền') || opt.toLowerCase().includes('bao nhieu tien'),
      'かいだん phải là cầu thang': (opt) => opt.toLowerCase().includes('cầu thang') || opt.toLowerCase().includes('cau thang'),
      'へや phải là phòng': (opt) => opt.toLowerCase().includes('phòng') || opt.toLowerCase().includes('phong'),
      'にわ phải là sân/vườn': (opt) => opt.toLowerCase().includes('sân') || opt.toLowerCase().includes('vườn') || opt.toLowerCase().includes('san') || opt.toLowerCase().includes('vuon'),
      'おくに phải là nước/quốc gia': (opt) => opt.toLowerCase().includes('nước') || opt.toLowerCase().includes('quốc gia') || opt.toLowerCase().includes('nuoc') || opt.toLowerCase().includes('quoc gia'),
      'くつ phải là giầy': (opt) => opt.toLowerCase().includes('giầy') || opt.toLowerCase().includes('giay'),
      'ネクタイ phải là cà vạt': (opt) => opt.toLowerCase().includes('cà vạt') || opt.toLowerCase().includes('ca vat'),
      'ワイン phải là rượu vang': (opt) => opt.toLowerCase().includes('rượu vang') || opt.toLowerCase().includes('ruou vang'),
      'ひゃく phải là trăm': (opt) => opt.toLowerCase().includes('trăm') || opt.toLowerCase().includes('tram'),
      'まん phải là vạn/mười nghìn': (opt) => opt.toLowerCase().includes('vạn') || opt.toLowerCase().includes('mười nghìn') || opt.toLowerCase().includes('van') || opt.toLowerCase().includes('muoi nghin'),
      'ロビー phải là phòng đợi/tiền sảnh': (opt) => opt.toLowerCase().includes('phòng đợi') || opt.toLowerCase().includes('tiền sảnh') || opt.toLowerCase().includes('phong doi') || opt.toLowerCase().includes('tien sanh'),
      'chỗ này phải là ここ': (opt) => opt.includes('ここ'),
      'chỗ kia phải là あそこ': (opt) => opt.includes('あそこ'),
      '階段 phải đọc là かいだん': (opt) => opt.includes('かいだん'),
      '食堂 phải đọc là しょくどう': (opt) => opt.includes('しょくどう'),
      '～円 phải đọc là ～えん': (opt) => opt.includes('～えん') || opt.includes('えん'),
      '～階 phải đọc là ～かい': (opt) => opt.includes('～かい') || opt.includes('かい')
    };
    
    for (const [pattern, checkFn] of Object.entries(answerFixes)) {
      if (explanation.includes(pattern)) {
        const correctIdx = fixed.options.findIndex(checkFn);
        if (correctIdx !== -1) {
          fixed.correctAnswer = correctIdx;
          break;
        }
      }
    }
  }
  
  if (errors.includes('lesson_mismatch')) {
    const explanation = analysisDetail.explanation || '';
    
    if (explanation.includes('Vượt phạm vi bài 3')) {
      const questionWords = extractVocabularyWords(fixed.question);
      const questionHasViolation = questionWords.some(word => !isWordInLesson3(word));
      
      if (questionHasViolation) {
        return null;
      }
      
      const violations = explanation.split('Vượt phạm vi bài 3:')[1]?.trim() || '';
      const optionViolations = new Set();
      
      violations.split(',').forEach(v => {
        const match = v.match(/option\[(\d+)\]:\s*(.+)/);
        if (match) {
          optionViolations.add(parseInt(match[1]));
        }
      });
      
      fixed.options = fixed.options.map((opt, idx) => {
        if (optionViolations.has(idx)) {
          const words = extractVocabularyWords(opt);
          const invalidWords = words.filter(word => !isWordInLesson3(word));
          
          if (invalidWords.length > 0 && idx === fixed.correctAnswer) {
            return null;
          }
          
          if (invalidWords.length > 0) {
            let newOpt = opt;
            invalidWords.forEach(invalidWord => {
              const escaped = invalidWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              newOpt = newOpt.replace(new RegExp(escaped, 'g'), '');
            });
            newOpt = newOpt.replace(/\s+/g, ' ').trim();
            if (newOpt.length === 0) {
              return null;
            }
            return newOpt;
          }
        }
        return opt;
      }).filter(opt => opt !== null);
      
      if (fixed.options.length < 2) {
        return null;
      }
      
      if (fixed.correctAnswer >= fixed.options.length) {
        fixed.correctAnswer = 0;
      }
    }
  }
  
  if (errors.includes('technical_error')) {
    const explanation = analysisDetail.explanation || '';
    
    if (explanation.includes('trùng lặp')) {
      return null;
    }
    
    if (!fixed.options || fixed.options.length < 2) {
      return null;
    }
    
    const seen = new Set();
    fixed.options = fixed.options.filter(opt => {
      const key = opt.trim().toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
    
    if (fixed.options.length < 2) {
      return null;
    }
    
    if (typeof fixed.correctAnswer !== 'number' || fixed.correctAnswer < 0 || fixed.correctAnswer >= fixed.options.length) {
      fixed.correctAnswer = 0;
    }
  }
  
  return fixed;
}

const fixedQuiz = [];
const analysisMap = new Map();
analysis.details.forEach(detail => {
  analysisMap.set(detail.id, detail);
});

let removedCount = 0;
let fixedCount = 0;
const seenQuestions = new Set();

quiz.forEach(item => {
  const analysisDetail = analysisMap.get(item.id);
  
  if (analysisDetail) {
    const questionKey = item.question.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (seenQuestions.has(questionKey)) {
      removedCount++;
      return;
    }
    seenQuestions.add(questionKey);
    
    const fixed = fixQuizItem(item, analysisDetail);
    if (fixed !== null) {
      if (analysisDetail.errors && analysisDetail.errors.length > 0) {
        fixedCount++;
      }
      fixedQuiz.push(fixed);
    } else {
      removedCount++;
    }
  } else {
    const questionKey = item.question.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (seenQuestions.has(questionKey)) {
      removedCount++;
      return;
    }
    seenQuestions.add(questionKey);
    fixedQuiz.push(item);
  }
});

fs.writeFileSync(quizPath, JSON.stringify(fixedQuiz, null, 2), 'utf8');
console.log(`Quiz3 đã được cập nhật: ${quizPath}`);
console.log(`Tổng items: ${fixedQuiz.length} (gốc: ${quiz.length})`);
console.log(`Đã sửa: ${fixedCount}, Đã xóa: ${removedCount}`);
