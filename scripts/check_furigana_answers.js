const fs = require('fs');
const path = require('path');

const quizDir = path.join(__dirname, '..', 'data', 'quiz');
const files = fs.readdirSync(quizDir).filter(f => f.endsWith('.json')).sort();

const errors = [];

function extractFurigana(html) {
  const furiganaMatches = html.match(/<rt>([^<]+)<\/rt>/g);
  if (!furiganaMatches) return null;
  
  const furiganaTexts = furiganaMatches.map(match => 
    match.replace(/<\/?rt>/g, '').trim()
  );
  
  return furiganaTexts.join('');
}

function extractKanjiWithFurigana(html) {
  const rubyMatches = html.match(/<ruby>([^<]+)<rp>[^<]*<\/rp><rt>([^<]+)<\/rt><rp>[^<]*<\/rp><\/ruby>/g);
  if (!rubyMatches) return null;
  
  const results = [];
  rubyMatches.forEach(match => {
    const kanjiMatch = match.match(/<ruby>([^<]+)</);
    const furiganaMatch = match.match(/<rt>([^<]+)<\/rt>/);
    if (kanjiMatch && furiganaMatch) {
      results.push({
        kanji: kanjiMatch[1],
        furigana: furiganaMatch[1]
      });
    }
  });
  
  return results;
}

function checkQuestion(question, filePath) {
  const { id, question: qText, options, correctAnswer } = question;
  
  if (correctAnswer < 0 || correctAnswer >= options.length) {
    return;
  }
  
  const correctValue = options[correctAnswer];
  
  if (qText.includes('<ruby>') && qText.includes('<rt>')) {
    const furigana = extractFurigana(qText);
    if (furigana) {
      const furiganaLower = furigana.trim().toLowerCase();
      const correctValueLower = correctValue.trim().toLowerCase();
      
      if (furiganaLower === correctValueLower) {
        return;
      }
      
      const matchingIndex = options.findIndex(opt => 
        opt.trim().toLowerCase() === furiganaLower
      );
      
      if (matchingIndex !== -1 && matchingIndex !== correctAnswer) {
        errors.push({
          file: path.basename(filePath),
          id,
          issue: 'Furigana in question does not match correct answer',
          question: qText.replace(/<[^>]*>/g, '').substring(0, 100),
          furigana: furigana,
          current: `correctAnswer: ${correctAnswer} (${correctValue})`,
          shouldBe: `correctAnswer: ${matchingIndex} (${options[matchingIndex]})`,
        });
      }
    }
  }
  
  const kanjiWithFurigana = extractKanjiWithFurigana(qText);
  if (kanjiWithFurigana && kanjiWithFurigana.length > 0) {
    kanjiWithFurigana.forEach(({ kanji, furigana }) => {
      const furiganaLower = furigana.trim().toLowerCase();
      const correctValueLower = correctValue.trim().toLowerCase();
      
      if (furiganaLower !== correctValueLower) {
        const matchingIndex = options.findIndex(opt => 
          opt.trim().toLowerCase() === furiganaLower
        );
        
        if (matchingIndex !== -1 && matchingIndex !== correctAnswer) {
          errors.push({
            file: path.basename(filePath),
            id,
            issue: `Furigana "${furigana}" for "${kanji}" does not match correct answer`,
            question: qText.replace(/<[^>]*>/g, '').substring(0, 100),
            furigana: furigana,
            current: `correctAnswer: ${correctAnswer} (${correctValue})`,
            shouldBe: `correctAnswer: ${matchingIndex} (${options[matchingIndex]})`,
          });
        }
      }
    });
  }
}

console.log('Checking furigana answers in all quiz files...\n');

files.forEach(file => {
  const filePath = path.join(quizDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(content);
    
    if (Array.isArray(questions)) {
      questions.forEach(q => checkQuestion(q, filePath));
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
});

if (errors.length === 0) {
  console.log('✓ No furigana answer errors found!');
} else {
  console.log(`\nFound ${errors.length} ERRORS:\n`);
  errors.forEach((error, index) => {
    console.log(`${index + 1}. [${error.file}] Q${error.id}: ${error.issue}`);
    console.log(`   Question: ${error.question}`);
    console.log(`   Furigana: ${error.furigana}`);
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
