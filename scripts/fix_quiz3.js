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

function hasVocabularyOutsideLesson3(text) {
  if (!text) return false;
  const words = extractVocabularyWords(text);
  return words.some(word => {
    if (word.includes('～')) {
      const base = word.replace('～', '');
      return !lessonVocab.has(base) && !basicGrammarParticles.has(base);
    }
    return !lessonVocab.has(word) && !basicGrammarParticles.has(word);
  });
}

function fixQuizItem(originalItem, analysisDetail) {
  const fixed = JSON.parse(JSON.stringify(originalItem));
  const errors = analysisDetail.errors || [];
  
  if (errors.length === 0) {
    return fixed;
  }
  
  if (errors.includes('answer_error')) {
    const explanation = analysisDetail.explanation || '';
    
    if (explanation.includes('せん phải là nghìn')) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('nghìn') || opt.toLowerCase().includes('nghin')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (explanation.includes('いくら phải là "bao nhiêu tiền"')) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('bao nhiêu tiền') || opt.toLowerCase().includes('bao nhieu tien')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (explanation.includes('かいだん phải là cầu thang')) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('cầu thang') || opt.toLowerCase().includes('cau thang')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (explanation.includes('へや phải là phòng')) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('phòng') || opt.toLowerCase().includes('phong')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (explanation.includes('にわ phải là sân/vườn')) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('sân') || opt.toLowerCase().includes('vườn') || 
        opt.toLowerCase().includes('san') || opt.toLowerCase().includes('vuon')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (explanation.includes('おくに phải là nước/quốc gia')) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('nước') || opt.toLowerCase().includes('quốc gia') ||
        opt.toLowerCase().includes('nuoc') || opt.toLowerCase().includes('quoc gia')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (explanation.includes('くつ phải là giầy')) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('giầy') || opt.toLowerCase().includes('giay')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (explanation.includes('ネクタイ phải là cà vạt')) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('cà vạt') || opt.toLowerCase().includes('ca vat')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (explanation.includes('ワイン phải là rượu vang')) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('rượu vang') || opt.toLowerCase().includes('ruou vang')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (explanation.includes('ひゃく phải là trăm')) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('trăm') || opt.toLowerCase().includes('tram')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (explanation.includes('まん phải là vạn/mười nghìn')) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('vạn') || opt.toLowerCase().includes('mười nghìn') ||
        opt.toLowerCase().includes('van') || opt.toLowerCase().includes('muoi nghin')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (explanation.includes('ロビー phải là phòng đợi/tiền sảnh')) {
      const correctIdx = fixed.options.findIndex(opt => 
        opt.toLowerCase().includes('phòng đợi') || opt.toLowerCase().includes('tiền sảnh') ||
        opt.toLowerCase().includes('phong doi') || opt.toLowerCase().includes('tien sanh')
      );
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (explanation.includes('chỗ này phải là ここ')) {
      const correctIdx = fixed.options.findIndex(opt => opt.includes('ここ'));
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
    
    if (explanation.includes('chỗ kia phải là あそこ')) {
      const correctIdx = fixed.options.findIndex(opt => opt.includes('あそこ'));
      if (correctIdx !== -1) {
        fixed.correctAnswer = correctIdx;
      }
    }
  }
  
  if (errors.includes('lesson_mismatch')) {
    const explanation = analysisDetail.explanation || '';
    
    if (explanation.includes('Vượt phạm vi bài 3')) {
      const violations = explanation.split('Vượt phạm vi bài 3:')[1]?.trim() || '';
      
      fixed.options = fixed.options.map((opt, idx) => {
        if (violations.includes(`option[${idx}]:`)) {
          const words = extractVocabularyWords(opt);
          const validWords = words.filter(word => {
            if (word.includes('～')) {
              const base = word.replace('～', '');
              return lessonVocab.has(base) || basicGrammarParticles.has(base);
            }
            return lessonVocab.has(word) || basicGrammarParticles.has(word);
          });
          
          if (validWords.length === 0) {
            return opt;
          }
          
          const invalidWords = words.filter(word => {
            if (word.includes('～')) {
              const base = word.replace('～', '');
              return !lessonVocab.has(base) && !basicGrammarParticles.has(base);
            }
            return !lessonVocab.has(word) && !basicGrammarParticles.has(word);
          });
          
          if (invalidWords.length > 0) {
            let newOpt = opt;
            invalidWords.forEach(invalidWord => {
              newOpt = newOpt.replace(new RegExp(invalidWord, 'g'), '');
            });
            newOpt = newOpt.replace(/\s+/g, ' ').trim();
            if (newOpt.length === 0) {
              return opt;
            }
            return newOpt;
          }
        }
        return opt;
      });
      
      fixed.options = fixed.options.filter(opt => opt.trim().length > 0);
      
      if (fixed.options.length < 2) {
        return originalItem;
      }
      
      if (fixed.correctAnswer >= fixed.options.length) {
        fixed.correctAnswer = 0;
      }
    }
  }
  
  return fixed;
}

const fixedQuiz = [];
const analysisMap = new Map();
analysis.details.forEach(detail => {
  analysisMap.set(detail.id, detail);
});

quiz.forEach(item => {
  const analysisDetail = analysisMap.get(item.id);
  if (analysisDetail) {
    const fixed = fixQuizItem(item, analysisDetail);
    fixedQuiz.push(fixed);
  } else {
    fixedQuiz.push(item);
  }
});

const outputPath = path.join(__dirname, '..', 'data', 'quiz', 'quiz3_fixed.json');
fs.writeFileSync(outputPath, JSON.stringify(fixedQuiz, null, 2), 'utf8');
console.log(`Fixed quiz saved to: ${outputPath}`);
console.log(`Total items: ${fixedQuiz.length}`);
