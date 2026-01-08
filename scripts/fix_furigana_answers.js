const fs = require('fs');
const path = require('path');

const quizDir = path.join(__dirname, '..', 'data', 'quiz');
const files = fs.readdirSync(quizDir).filter(f => f.endsWith('.json')).sort();

function extractFurigana(html) {
  const furiganaMatches = html.match(/<rt>([^<]+)<\/rt>/g);
  if (!furiganaMatches) return null;
  
  const furiganaTexts = furiganaMatches.map(match => 
    match.replace(/<\/?rt>/g, '').trim()
  );
  
  return furiganaTexts.join('');
}

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

function fixQuestion(question) {
  const { question: qText, options, correctAnswer } = question;
  
  if (correctAnswer < 0 || correctAnswer >= options.length) {
    return question;
  }
  
  if (qText.includes('<ruby>') && qText.includes('<rt>')) {
    const furigana = extractFurigana(qText);
    if (furigana) {
      const furiganaLower = furigana.trim().toLowerCase();
      const correctValueLower = options[correctAnswer].trim().toLowerCase();
      
      if (furiganaLower !== correctValueLower) {
        const matchingIndex = options.findIndex(opt => 
          opt.trim().toLowerCase() === furiganaLower
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
    
    if (Array.isArray(questions)) {
      let fixed = false;
      const fixedQuestions = questions.map(q => {
        const fixedQ = fixQuestion(q);
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
