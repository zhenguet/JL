const fs = require('fs');
const path = require('path');

const QUIZ_FILE = path.join(__dirname, '..', 'data', 'quiz', 'quiz50.json');
const LESSON_FILE = path.join(__dirname, '..', 'data', 'lesson', 'lesson50.json');

function getLessonVocab() {
  const vocab = new Set();
  try {
    let content = fs.readFileSync(LESSON_FILE, 'utf-8');
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    const data = JSON.parse(content);
    data.forEach(item => {
      if (item.hiragana) vocab.add(item.hiragana);
      if (item.kanji) vocab.add(item.kanji.replace(/～/g, '').trim());
    });
  } catch (e) {
    console.error('Error reading lesson:', e.message);
  }
  return vocab;
}

function checkQuiz50() {
  const quizData = JSON.parse(fs.readFileSync(QUIZ_FILE, 'utf-8'));
  const lessonVocab = getLessonVocab();
  
  console.log('Quiz50 Analysis:\n');
  console.log(`Total questions: ${quizData.length}`);
  console.log(`Lesson vocabulary items: ${lessonVocab.size}\n`);
  
  const issues = [];
  let relatedCount = 0;
  
  quizData.forEach((item, idx) => {
    const question = item.question || '';
    const cleanQ = question.replace(/<[^>]*>/g, '').replace(/<ruby>.*?<\/ruby>/g, '');
    
    let hasRelatedWord = false;
    const questionWords = cleanQ.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]+/g) || [];
    
    questionWords.forEach(word => {
      if (lessonVocab.has(word)) {
        hasRelatedWord = true;
      }
    });
    
    if (hasRelatedWord) {
      relatedCount++;
    } else if (idx < 20) {
      issues.push({
        id: item.id,
        question: cleanQ.substring(0, 60),
        options: item.options
      });
    }
  });
  
  console.log(`Questions related to lesson50: ${relatedCount}/${quizData.length} (${(relatedCount/quizData.length*100).toFixed(1)}%)`);
  console.log(`\nFirst 20 questions not matching lesson50:`);
  issues.slice(0, 20).forEach(issue => {
    console.log(`  Q${issue.id}: ${issue.question}`);
  });
}

checkQuiz50();
