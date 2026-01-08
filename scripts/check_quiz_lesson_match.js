const fs = require('fs');
const path = require('path');

const QUIZ_DIR = path.join(__dirname, '..', 'data', 'quiz');
const LESSON_DIR = path.join(__dirname, '..', 'data', 'lesson');

function extractJapaneseWords(text) {
  if (!text) return new Set();
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/<ruby>.*?<\/ruby>/g, '');
  text = text.replace(/<rp>.*?<\/rp>/g, '');
  text = text.replace(/<rt>.*?<\/rt>/g, '');
  const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]+/g;
  const matches = text.match(japanesePattern) || [];
  return new Set(matches.filter(word => word.length > 0));
}

function getLessonVocabulary(lessonFile) {
  const vocab = new Set();
  try {
    let content = fs.readFileSync(lessonFile, 'utf-8');
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    const data = JSON.parse(content);
    data.forEach(item => {
      if (item.hiragana) {
        vocab.add(item.hiragana);
      }
      if (item.kanji && item.kanji.trim()) {
        const kanji = item.kanji.replace(/～/g, '').trim();
        if (kanji) {
          vocab.add(kanji);
        }
      }
    });
  } catch (e) {
    console.error(`Error reading ${lessonFile}:`, e.message);
  }
  return vocab;
}

function checkQuizLessonMatch(quizNum) {
  const quizFile = path.join(QUIZ_DIR, `quiz${quizNum}.json`);
  const lessonFile = path.join(LESSON_DIR, `lesson${quizNum}.json`);
  
  if (!fs.existsSync(quizFile)) {
    console.log(`Quiz ${quizNum}: File not found`);
    return null;
  }
  
  if (!fs.existsSync(lessonFile)) {
    console.log(`Quiz ${quizNum}: Lesson file not found`);
    return null;
  }
  
  try {
    const quizData = JSON.parse(fs.readFileSync(quizFile, 'utf-8'));
    const lessonVocab = getLessonVocabulary(lessonFile);
    
    const commonWords = new Set([
      'です', 'ですか', 'は', 'が', 'を', 'に', 'で', 'から', 'の', 'も', 'と', 'や',
      'か', 'ね', 'よ', 'さん', 'ちゃん', 'くん', 'じん', 'さい', 'なん', 'だれ',
      'どなた', 'おいくつ', 'なんさい', 'どちら', 'どこ', 'いつ', 'どう', 'どんな',
      'これ', 'それ', 'あれ', 'この', 'その', 'あの', 'どの', 'どれ', 'はい', 'いいえ',
      'わたし', 'あなた', 'あのひと', 'あのかた', 'みなさん', 'はじめまして',
      'どうぞよろしく', 'おなまえは', 'しつれいですが', 'こちらは', 'からきました',
      'じゃ', 'でも', 'そして', 'しかし', 'から', 'まで', 'へ', 'と', 'A', 'B'
    ]);
    
    let matchCount = 0;
    let totalQuestions = 0;
    const unmatchedQuestions = [];
    
    quizData.forEach((item) => {
      totalQuestions++;
      const question = item.question || '';
      const questionWords = extractJapaneseWords(question);
      
      let hasMatch = false;
      questionWords.forEach(word => {
        if (word && word.length > 1) {
          const wordClean = word.trim().replace(/[？。、]/g, '');
          if (!wordClean) return;
          
          if (lessonVocab.has(wordClean) || commonWords.has(wordClean)) {
            hasMatch = true;
          } else {
            for (const vocabWord of lessonVocab) {
              if (wordClean.includes(vocabWord) || vocabWord.includes(wordClean)) {
                hasMatch = true;
                break;
              }
            }
          }
        }
      });
      
      if (hasMatch) {
        matchCount++;
      } else {
        unmatchedQuestions.push({
          id: item.id,
          question: question.replace(/<[^>]*>/g, '').substring(0, 80)
        });
      }
    });
    
    const matchPercentage = totalQuestions > 0 ? (matchCount / totalQuestions * 100).toFixed(1) : 0;
    
    return {
      quizNum,
      totalQuestions,
      matchCount,
      matchPercentage,
      unmatchedQuestions: unmatchedQuestions.slice(0, 10)
    };
  } catch (e) {
    console.error(`Error checking quiz ${quizNum}:`, e.message);
    return null;
  }
}

function main() {
  console.log('Checking quiz-lesson matches...\n');
  
  const results = [];
  
  for (let i = 50; i >= 1; i--) {
    const result = checkQuizLessonMatch(i);
    if (result) {
      results.push(result);
      console.log(`Quiz ${i}: ${result.matchCount}/${result.totalQuestions} (${result.matchPercentage}%) match lesson ${i}`);
      if (result.unmatchedQuestions.length > 0) {
        console.log(`  First unmatched: Q${result.unmatchedQuestions[0].id}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  
  const lowMatch = results.filter(r => parseFloat(r.matchPercentage) < 50);
  if (lowMatch.length > 0) {
    console.log(`\nQuizzes with low match (<50%):`);
    lowMatch.forEach(r => {
      console.log(`  Quiz ${r.quizNum}: ${r.matchPercentage}% match`);
    });
  }
  
  const highMatch = results.filter(r => parseFloat(r.matchPercentage) >= 80);
  console.log(`\nQuizzes with high match (>=80%): ${highMatch.length}/${results.length}`);
  
  const avgMatch = results.reduce((sum, r) => sum + parseFloat(r.matchPercentage), 0) / results.length;
  console.log(`Average match percentage: ${avgMatch.toFixed(1)}%`);
}

if (require.main === module) {
  main();
}

module.exports = { checkQuizLessonMatch };
