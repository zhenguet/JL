const fs = require('fs');
const path = require('path');

const quizPath = path.join(__dirname, '..', 'data', 'quiz', 'quiz1.json');
const analysisPath = path.join(__dirname, '..', 'quiz1_analysis.json');
const lessonPath = path.join(__dirname, '..', 'data', 'lesson', 'lesson1.json');

const quiz = JSON.parse(fs.readFileSync(quizPath, 'utf8').replace(/^\uFEFF/, ''));
const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8').replace(/^\uFEFF/, ''));
const lesson = JSON.parse(fs.readFileSync(lessonPath, 'utf8').replace(/^\uFEFF/, ''));

const lessonVocab = new Set();
lesson.forEach(item => {
  if (item.hiragana) lessonVocab.add(item.hiragana);
  if (item.kanji) lessonVocab.add(item.kanji);
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

function fixQuizItem(originalItem, analysisDetail) {
  let fixed = JSON.parse(JSON.stringify(originalItem));
  const errors = analysisDetail.errors || [];
  
  if (errors.length === 0) {
    return fixed;
  }
  
  if (errors.includes('lesson_mismatch')) {
    const explanation = analysisDetail.explanation || '';
    
    if (explanation.includes('Vượt phạm vi bài 1')) {
      const questionWords = extractVocabularyWords(fixed.question);
      const questionHasViolation = questionWords.some(word => !isWordInLesson1(word));
      
      if (questionHasViolation) {
        return null;
      }
      
      const violations = explanation.split('Vượt phạm vi bài 1:')[1]?.trim() || '';
      const optionViolations = new Set();
      
      violations.split(';').forEach(v => {
        const match = v.match(/option\[(\d+)\]:\s*(.+)/);
        if (match) {
          optionViolations.add(parseInt(match[1]));
        }
      });
      
      fixed.options = fixed.options.map((opt, idx) => {
        if (optionViolations.has(idx)) {
          const words = extractVocabularyWords(opt);
          const invalidWords = words.filter(word => !isWordInLesson1(word));
          
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
  
  if (errors.includes('answer_error')) {
    const explanation = analysisDetail.explanation || '';
    const questionText = fixed.question.replace(/<[^>]*>/g, '').replace(/<ruby>.*?<\/ruby>/g, '');
    
    if (questionText.includes('ひと') && fixed.options) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('người') || opt.toLowerCase().includes('nguoi')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (questionText.includes('あのひと') && fixed.options) {
      const correctIdx = fixed.options.findIndex(opt => opt.includes('あのひと'));
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (questionText.includes('かた') && fixed.options) {
      const correctIdx = fixed.options.findIndex(opt => opt.includes('かた'));
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (questionText.includes('しゃいん') && fixed.options) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('nhân viên') || opt.toLowerCase().includes('nhan vien')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (questionText.includes('がくせい') && fixed.options) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('học sinh') || 
        opt.toLowerCase().includes('sinh viên') ||
        opt.toLowerCase().includes('hoc sinh') ||
        opt.toLowerCase().includes('sinh vien')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (questionText.includes('せんせい') && fixed.options) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('thầy') || 
        opt.toLowerCase().includes('cô') ||
        opt.toLowerCase().includes('giáo viên') ||
        opt.toLowerCase().includes('giao vien')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (questionText.includes('なんさい') && fixed.options) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('tuổi') || opt.toLowerCase().includes('tuoi')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (questionText.includes('おいくつ') && fixed.options) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('tuổi') || opt.toLowerCase().includes('tuoi')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (questionText.includes('だれ') && fixed.options) {
      const correctIdx = fixed.options.findIndex(opt => opt.toLowerCase().includes('ai'));
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (questionText.includes('どなた') && fixed.options) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('ai') || 
        opt.toLowerCase().includes('người nào') ||
        opt.toLowerCase().includes('nguoi nao')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (questionText.includes('こちらは') && fixed.options) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('đây') || opt.toLowerCase().includes('day')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (questionText.includes('はじめまして') && fixed.options) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('xin chào') || 
        opt.toLowerCase().includes('lần đầu') ||
        opt.toLowerCase().includes('xin chao') ||
        opt.toLowerCase().includes('lan dau')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (questionText.includes('どうぞよろしく') && fixed.options) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('giúp đỡ') || opt.toLowerCase().includes('giup do')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (questionText.includes('しつれいですが') && fixed.options) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('xin lỗi') || opt.toLowerCase().includes('xin loi')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if ((questionText.includes('～からきました') || questionText.includes('から きました')) && fixed.options) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('từ') || opt.toLowerCase().includes('đến từ') ||
        opt.toLowerCase().includes('den tu')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
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
    
    if (typeof fixed.difficulty !== 'number' || fixed.difficulty <= 0) {
      fixed.difficulty = 1;
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
    
    if (analysisDetail.errors.includes('lesson_mismatch')) {
      removedCount++;
      return;
    }
    
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

fixedQuiz.forEach((item, idx) => {
  item.id = idx + 1;
});

fs.writeFileSync(quizPath, JSON.stringify(fixedQuiz, null, 2), 'utf8');
console.log(`Quiz1 đã được cập nhật: ${quizPath}`);
console.log(`Tổng items: ${fixedQuiz.length} (gốc: ${quiz.length})`);
console.log(`Đã sửa: ${fixedCount}, Đã xóa: ${removedCount}`);
