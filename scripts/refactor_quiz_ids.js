const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const QUIZ_DIR = path.join(BASE_DIR, 'data', 'quiz');

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

function refactorQuizIds(filePath) {
  const quizData = loadJson(filePath);
  let changed = false;

  quizData.forEach((question, index) => {
    const newId = index + 1;
    if (question.id !== newId) {
      question.id = newId;
      changed = true;
    }
  });

  if (changed) {
    saveJson(filePath, quizData);
    return true;
  }

  return false;
}

function main() {
  console.log('Refactoring quiz IDs...\n');

  const files = fs.readdirSync(QUIZ_DIR)
    .filter((file) => file.startsWith('quiz') && file.endsWith('.json'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/quiz(\d+)/)?.[1] || '0');
      const numB = parseInt(b.match(/quiz(\d+)/)?.[1] || '0');
      return numA - numB;
    });

  let totalFixed = 0;

  files.forEach((file) => {
    const filePath = path.join(QUIZ_DIR, file);
    const fixed = refactorQuizIds(filePath);
    if (fixed) {
      totalFixed++;
      console.log(`✓ Fixed IDs in ${file}`);
    }
  });

  console.log(`\nCompleted! Fixed ${totalFixed} out of ${files.length} files.`);
}

main();
