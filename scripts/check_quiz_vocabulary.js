const fs = require('fs');
const path = require('path');

const QUIZ_DIR = path.join(__dirname, '..', 'data', 'quiz');
const LESSON_DIR = path.join(__dirname, '..', 'data', 'lesson');

function extractJapaneseWords(text) {
  if (!text) return new Set();
  
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, '');
  // Remove ruby annotations
  text = text.replace(/<ruby>.*?<\/ruby>/g, '');
  text = text.replace(/<rp>.*?<\/rp>/g, '');
  text = text.replace(/<rt>.*?<\/rt>/g, '');
  
  // Find all Japanese words (hiragana, katakana, kanji)
  const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]+/g;
  const matches = text.match(japanesePattern) || [];
  
  return new Set(matches.filter(word => word.length > 0));
}

function getLessonVocabulary(lessonFile) {
  const vocab = new Set();
  try {
    let content = fs.readFileSync(lessonFile, 'utf-8');
    // Remove BOM if present
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

function checkQuiz(quizFile, lessonFile, quizNum) {
  const issues = [];
  
  try {
    const quizData = JSON.parse(fs.readFileSync(quizFile, 'utf-8'));
    const lessonVocab = getLessonVocabulary(lessonFile);
    
    // Common words that can appear in any quiz (grammar words, particles, etc.)
    const commonWords = new Set([
      'です', 'ですか', 'は', 'が', 'を', 'に', 'で', 'から', 'の', 'も', 'と', 'や',
      'か', 'ね', 'よ', 'さん', 'ちゃん', 'くん', 'じん', 'さい', 'なん', 'だれ',
      'どなた', 'おいくつ', 'なんさい', 'どちら', 'どこ', 'いつ', 'どう', 'どんな',
      'これ', 'それ', 'あれ', 'この', 'その', 'あの', 'どの', 'どれ', 'はい', 'いいえ',
      'わたし', 'あなた', 'あのひと', 'あのかた', 'みなさん', 'はじめまして',
      'どうぞよろしく', 'おなまえは', 'しつれいですが', 'こちらは', 'からきました',
      'じゃ', 'でも', 'そして', 'しかし', 'でも', 'から', 'まで', 'へ', 'と'
    ]);
    
    // Add all previous lesson vocabularies (words from earlier lessons can be used)
    // This is a simplified approach - in reality, we should check if word is from current or earlier lessons
    for (let i = 1; i < quizNum; i++) {
      const prevLessonFile = path.join(LESSON_DIR, `lesson${i}.json`);
      if (fs.existsSync(prevLessonFile)) {
        const prevVocab = getLessonVocabulary(prevLessonFile);
        prevVocab.forEach(word => lessonVocab.add(word));
      }
    }
    
    quizData.forEach((item, index) => {
      const question = item.question || '';
      const options = item.options || [];
      
      // Extract words from question only (not from options, as options may contain wrong answers)
      const questionWords = extractJapaneseWords(question);
      
      // Check for words not in lesson (only check question, not options)
      const allWords = questionWords;
      const unknownWords = [];
      
      allWords.forEach(word => {
        if (word && word.length > 1) {
          const wordClean = word.trim().replace(/[？。、]/g, '');
          if (!wordClean) return;
          
          // Check if word is in lesson vocab or common words
          let found = false;
          
          // Direct match
          if (lessonVocab.has(wordClean) || commonWords.has(wordClean)) {
            found = true;
          }
          
          // Partial match (word contains or is contained in vocab)
          if (!found) {
            for (const vocabWord of lessonVocab) {
              if (wordClean.includes(vocabWord) || vocabWord.includes(wordClean)) {
                found = true;
                break;
              }
            }
          }
          
          // Check common words
          if (!found) {
            for (const commonWord of commonWords) {
              if (wordClean.includes(commonWord) || commonWord.includes(wordClean)) {
                found = true;
                break;
              }
            }
          }
          
          if (!found) {
            unknownWords.push(wordClean);
          }
        }
      });
      
      if (unknownWords.length > 0) {
        // Filter out very short words and numbers
        const filteredUnknown = unknownWords.filter(w => 
          w.length > 1 && 
          !/^[0-9]+$/.test(w) &&
          !['の', 'は', 'が', 'を', 'に', 'で'].includes(w)
        );
        
        if (filteredUnknown.length > 0) {
          issues.push({
            id: item.id,
            index: index + 1,
            question: question.substring(0, 100),
            unknownWords: [...new Set(filteredUnknown)]
          });
        }
      }
    });
  } catch (e) {
    console.error(`Error checking ${quizFile}:`, e.message);
    return null;
  }
  
  return issues;
}

function main() {
  const allIssues = {};
  let totalIssues = 0;
  
  console.log('Checking all quizzes against their corresponding lessons...\n');
  
  for (let i = 1; i <= 50; i++) {
    const quizFile = path.join(QUIZ_DIR, `quiz${i}.json`);
    const lessonFile = path.join(LESSON_DIR, `lesson${i}.json`);
    
    if (!fs.existsSync(quizFile)) {
      continue;
    }
    if (!fs.existsSync(lessonFile)) {
      console.log(`Warning: lesson${i}.json not found`);
      continue;
    }
    
    process.stdout.write(`Checking quiz${i}... `);
    const issues = checkQuiz(quizFile, lessonFile, i);
    
    if (issues && issues.length > 0) {
      allIssues[i] = issues;
      totalIssues += issues.length;
      console.log(`Found ${issues.length} potential issues`);
    } else {
      console.log('OK');
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY OF POTENTIAL ISSUES');
  console.log('='.repeat(80));
  
  const summary = [];
  for (const [quizNum, issues] of Object.entries(allIssues)) {
    console.log(`\nQuiz ${quizNum} - ${issues.length} potential issues:`);
    const wordCount = {};
    issues.forEach(issue => {
      issue.unknownWords.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });
    });
    
    const sortedWords = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    console.log('  Most common unknown words:');
    sortedWords.forEach(([word, count]) => {
      console.log(`    ${word}: ${count} times`);
    });
    
    // Show first few issues
    issues.slice(0, 5).forEach(issue => {
      console.log(`  ID ${issue.id} (Q${issue.index}): ${issue.unknownWords.join(', ')}`);
      console.log(`    ${issue.question.substring(0, 60)}...`);
    });
    if (issues.length > 5) {
      console.log(`  ... and ${issues.length - 5} more issues`);
    }
    
    summary.push({
      quiz: parseInt(quizNum),
      issueCount: issues.length,
      commonWords: sortedWords.map(([word]) => word)
    });
  }
  
  // Save detailed results
  const outputFile = path.join(__dirname, 'quiz_vocabulary_issues.json');
  fs.writeFileSync(outputFile, JSON.stringify(allIssues, null, 2), 'utf-8');
  console.log(`\n\nDetailed results saved to: ${outputFile}`);
  console.log(`\nTotal quizzes with issues: ${Object.keys(allIssues).length}`);
  console.log(`Total potential issues: ${totalIssues}`);
}

if (require.main === module) {
  main();
}

module.exports = { checkQuiz, getLessonVocabulary };
