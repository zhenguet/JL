const fs = require('fs');
const path = require('path');

const quizDir = path.join(__dirname, '..', 'data', 'quiz');
const files = fs.readdirSync(quizDir).filter(f => f.endsWith('.json')).sort();
const LESSON_DIR = path.join(__dirname, '..', 'data', 'lesson');

const errors = [];

function loadJson(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }
  return JSON.parse(content);
}

function extractTextFromHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/（　）/g, '').trim();
}

function getLessonData(quizFile) {
  const match = quizFile.match(/quiz(\d+)\.json/);
  if (!match) return null;
  
  const lessonNum = parseInt(match[1], 10);
  const lessonFile = path.join(LESSON_DIR, `lesson${lessonNum}.json`);
  
  if (fs.existsSync(lessonFile)) {
    try {
      return loadJson(lessonFile);
    } catch (e) {
      return null;
    }
  }
  return null;
}

function checkQuestion(question, filePath, lessonData) {
  const { id, question: qText, options, correctAnswer } = question;
  
  if (correctAnswer < 0 || correctAnswer >= options.length) {
    return;
  }
  
  const cleanQuestion = extractTextFromHtml(qText);
  const correctValue = options[correctAnswer];
  
  if (!lessonData) return;
  
  const hasJapaneseChars = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(cleanQuestion);
  
  if (!hasJapaneseChars) {
    const questionLower = cleanQuestion.toLowerCase().trim();
    
    const vocabItem = lessonData.find(item => {
      if (!item.vi) return false;
      const viLower = item.vi.toLowerCase().trim();
      return viLower === questionLower || questionLower.includes(viLower) || viLower.includes(questionLower);
    });
    
    if (vocabItem) {
      if (vocabItem.hiragana) {
        const hiraganaLower = vocabItem.hiragana.trim().toLowerCase();
        const correctValueLower = correctValue.trim().toLowerCase();
        
        if (hiraganaLower !== correctValueLower) {
          const matchingIndex = options.findIndex(opt => 
            opt.trim().toLowerCase() === hiraganaLower
          );
          
          if (matchingIndex !== -1 && matchingIndex !== correctAnswer) {
            errors.push({
              file: path.basename(filePath),
              id,
              issue: `Vietnamese question "${cleanQuestion}" should match hiragana "${vocabItem.hiragana}"`,
              question: cleanQuestion.substring(0, 100),
              expectedHiragana: vocabItem.hiragana,
              current: `correctAnswer: ${correctAnswer} (${correctValue})`,
              shouldBe: `correctAnswer: ${matchingIndex} (${options[matchingIndex]})`,
            });
          }
        }
      }
      
      if (vocabItem.kanji) {
        const kanjiLower = vocabItem.kanji.trim().toLowerCase();
        const correctValueLower = correctValue.trim().toLowerCase();
        
        if (kanjiLower === correctValueLower) {
          const hiraganaIndex = options.findIndex(opt => 
            opt.trim().toLowerCase() === vocabItem.hiragana?.trim().toLowerCase()
          );
          
          if (hiraganaIndex !== -1 && vocabItem.hiragana && options.some(opt => /[\u3040-\u309F\u30A0-\u30FF]/.test(opt))) {
            errors.push({
              file: path.basename(filePath),
              id,
              issue: `Vietnamese question "${cleanQuestion}" should use hiragana "${vocabItem.hiragana}" not kanji`,
              question: cleanQuestion.substring(0, 100),
              expectedHiragana: vocabItem.hiragana,
              current: `correctAnswer: ${correctAnswer} (${correctValue})`,
              shouldBe: `correctAnswer: ${hiraganaIndex} (${options[hiraganaIndex]})`,
            });
          }
        }
      }
    }
  }
}

console.log('Checking meaning-based answers in all quiz files...\n');

files.forEach(file => {
  const filePath = path.join(quizDir, file);
  try {
    const questions = loadJson(filePath);
    const lessonData = getLessonData(file);
    
    if (Array.isArray(questions)) {
      questions.forEach(q => checkQuestion(q, filePath, lessonData));
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
});

if (errors.length === 0) {
  console.log('✓ No meaning answer errors found!');
} else {
  console.log(`\nFound ${errors.length} ERRORS:\n`);
  errors.forEach((error, index) => {
    console.log(`${index + 1}. [${error.file}] Q${error.id}: ${error.issue}`);
    console.log(`   Question: ${error.question}`);
    console.log(`   Expected: ${error.expectedHiragana}`);
    console.log(`   Current: ${error.current}`);
    console.log(`   Should be: ${error.shouldBe}`);
    console.log('');
  });
  
  console.log('\nSummary by file:');
  const byFile = {};
  errors.forEach(e => {
    if (!byFile[e.file]) byFile[e.file] = [];
    byFile[e.file].push(e);
  });
  Object.keys(byFile).sort().forEach(file => {
    console.log(`  ${file}: ${byFile[file].length} errors`);
  });
}
