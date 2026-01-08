const fs = require('fs');
const path = require('path');

const quizDir = path.join(__dirname, '..', 'data', 'quiz');
const files = fs.readdirSync(quizDir).filter(f => f.endsWith('.json')).sort();
const LESSON_DIR = path.join(__dirname, '..', 'data', 'lesson');

function loadJson(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }
  return JSON.parse(content);
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
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

function fixQuestion(question, lessonData) {
  const { question: qText, options, correctAnswer } = question;
  
  if (correctAnswer < 0 || correctAnswer >= options.length) {
    return question;
  }
  
  const cleanQuestion = extractTextFromHtml(qText);
  const correctValue = options[correctAnswer];
  
  if (!lessonData) return question;
  
  const hasJapaneseChars = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(cleanQuestion);
  
  if (!hasJapaneseChars) {
    const questionLower = cleanQuestion.toLowerCase().trim();
    
    const vocabItem = lessonData.find(item => {
      if (!item.vi) return false;
      const viLower = item.vi.toLowerCase().trim();
      return viLower === questionLower || questionLower.includes(viLower) || viLower.includes(questionLower);
    });
    
    if (vocabItem && vocabItem.hiragana) {
      const hiraganaLower = vocabItem.hiragana.trim().toLowerCase();
      const correctValueLower = correctValue.trim().toLowerCase();
      
      if (hiraganaLower !== correctValueLower) {
        const matchingIndex = options.findIndex(opt => 
          opt.trim().toLowerCase() === hiraganaLower
        );
        
        if (matchingIndex !== -1 && matchingIndex !== correctAnswer) {
          return {
            ...question,
            correctAnswer: matchingIndex
          };
        }
      }
    }
  }
  
  return question;
}

let totalFixed = 0;
const fixedFiles = [];

files.forEach(file => {
  const filePath = path.join(quizDir, file);
  try {
    const questions = loadJson(filePath);
    const lessonData = getLessonData(file);
    
    if (Array.isArray(questions)) {
      let fixed = false;
      const fixedQuestions = questions.map(q => {
        const fixedQ = fixQuestion(q, lessonData);
        if (JSON.stringify(fixedQ) !== JSON.stringify(q)) {
          fixed = true;
          totalFixed++;
        }
        return fixedQ;
      });
      
      if (fixed) {
        saveJson(filePath, fixedQuestions);
        fixedFiles.push(file);
      }
    }
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
  }
});

console.log(`\nFixed ${totalFixed} questions in ${fixedFiles.length} files:`);
fixedFiles.forEach(file => console.log(`  - ${file}`));
