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

function extractTextFromHtml(html) {
  return html.replace(/<[^>]+>/g, '').trim();
}

/**
 * Determine question difficulty level from 1 (easiest) to 5 (hardest)
 * 
 * Evaluation criteria:
 * - Level 1: Basic questions, simple vocabulary, no kanji or with full furigana
 * - Level 2: Medium questions, some kanji with furigana, basic grammar
 * - Level 3: Medium-hard questions, kanji present, more complex grammar
 * - Level 4: Hard questions, many kanji, advanced grammar, long sentences
 * - Level 5: Very hard questions, complex grammar, advanced vocabulary, very long sentences
 */
function determineDifficulty(question) {
  const questionText = extractTextFromHtml(question.question);
  
  // Count kanji characters (more kanji = harder)
  const kanjiCount = (questionText.match(/[\u4E00-\u9FAF]/g) || []).length;
  
  // Check for complex grammar patterns (conditional, causative, passive, etc.)
  const hasComplexGrammar = 
    questionText.includes('（　）') && 
    (questionText.includes('ても') || 
     questionText.includes('たら') || 
     questionText.includes('ば') ||
     questionText.includes('ながら') ||
     questionText.includes('のに') ||
     questionText.includes('ので') ||
     questionText.includes('させ') ||
     questionText.includes('られる') ||
     questionText.includes('させられる'));
  
  // Check for very complex grammar (causative-passive, complex conditionals)
  const hasVeryComplexGrammar = 
    questionText.includes('させられる') ||
    questionText.includes('させていただ') ||
    questionText.includes('ていただ') ||
    (questionText.includes('ば') && questionText.includes('なら'));
  
  // Check for conversation patterns (usually medium difficulty)
  const hasConversation = questionText.includes('A：') && questionText.includes('B：');
  
  // Check for ruby/furigana (has kanji but with reading assistance)
  const hasRuby = question.question.includes('<ruby>');
  
  // Check question length (longer questions are usually harder)
  const isLongQuestion = questionText.length > 100;
  const isVeryLongQuestion = questionText.length > 150;
  
  // Check complexity of options
  const hasLongOptions = question.options.some(opt => opt.length > 50);
  const hasVeryLongOptions = question.options.some(opt => opt.length > 80);
  
  // Scoring system
  let score = 0;
  
  // Level 1: Basic questions
  if (kanjiCount === 0 && !hasRuby) score = 0;
  if (!hasComplexGrammar && !hasConversation && kanjiCount === 0) score = 0;
  
  // Level 2: Medium questions
  if (hasRuby && kanjiCount <= 3 && !hasComplexGrammar) score = 1;
  if (hasConversation && !hasComplexGrammar && kanjiCount <= 2) score = 1;
  if (kanjiCount > 0 && kanjiCount <= 3 && !hasRuby && !hasComplexGrammar) score = 1;
  
  // Level 3: Medium-hard questions
  if (hasComplexGrammar && kanjiCount <= 5) score = 2;
  if (kanjiCount > 3 && kanjiCount <= 7 && hasRuby) score = 2;
  if (hasConversation && hasComplexGrammar) score = 2;
  if (isLongQuestion && kanjiCount <= 5) score = 2;
  
  // Level 4: Hard questions
  if (kanjiCount > 7 && kanjiCount <= 12) score = 3;
  if (hasComplexGrammar && kanjiCount > 5) score = 3;
  if (isLongQuestion && kanjiCount > 5) score = 3;
  if (hasLongOptions && hasComplexGrammar) score = 3;
  
  // Level 5: Very hard questions
  if (hasVeryComplexGrammar) score = 4;
  if (kanjiCount > 12) score = 4;
  if (isVeryLongQuestion && kanjiCount > 7) score = 4;
  if (hasVeryLongOptions && hasComplexGrammar && kanjiCount > 5) score = 4;
  
  // Convert score to difficulty 1-5
  // score 0 -> difficulty 1
  // score 1 -> difficulty 2
  // score 2 -> difficulty 3
  // score 3 -> difficulty 4
  // score 4 -> difficulty 5
  
  return Math.min(5, Math.max(1, score + 1));
}

function addDifficultyToQuizFile(filePath) {
  const quizData = loadJson(filePath);
  let updated = false;
  const difficultyStats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  const updatedQuiz = quizData.map((question) => {
    if (!question.difficulty) {
      question.difficulty = determineDifficulty(question);
      updated = true;
    }
    if (question.difficulty) {
      difficultyStats[question.difficulty] += 1;
    }
    return question;
  });

  if (updated) {
    saveJson(filePath, updatedQuiz);
  }

  return { updated, difficultyStats };
}

function main() {
  console.log('Adding difficulty levels to quiz questions...\n');
  
  const files = fs.readdirSync(QUIZ_DIR);
  const quizFiles = files.filter((f) => f.match(/^quiz\d+\.json$/));
  
  let processed = 0;
  let updated = 0;
  const difficultyStats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  quizFiles.forEach((file) => {
    const filePath = path.join(QUIZ_DIR, file);
    try {
      const { updated: wasUpdated, difficultyStats: fileStats } = addDifficultyToQuizFile(filePath);
      processed++;
      
      if (wasUpdated) {
        updated++;
      }
      
      Object.entries(fileStats).forEach(([level, count]) => {
        difficultyStats[level] += count;
      });
      
      if (processed % 10 === 0) {
        console.log(`  Processed ${processed} files...`);
      }
    } catch (error) {
      console.error(`  Error processing ${file}: ${error.message}`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('DIFFICULTY ASSIGNMENT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files processed: ${processed}`);
  console.log(`Files updated: ${updated}`);
  console.log('\nDifficulty distribution:');
  const total = difficultyStats[1] + difficultyStats[2] + difficultyStats[3] + difficultyStats[4] + difficultyStats[5];
  console.log(`  Level 1 (Dễ nhất): ${difficultyStats[1]} (${((difficultyStats[1] / total) * 100).toFixed(1)}%)`);
  console.log(`  Level 2 (Dễ): ${difficultyStats[2]} (${((difficultyStats[2] / total) * 100).toFixed(1)}%)`);
  console.log(`  Level 3 (Trung bình): ${difficultyStats[3]} (${((difficultyStats[3] / total) * 100).toFixed(1)}%)`);
  console.log(`  Level 4 (Khó): ${difficultyStats[4]} (${((difficultyStats[4] / total) * 100).toFixed(1)}%)`);
  console.log(`  Level 5 (Rất khó): ${difficultyStats[5]} (${((difficultyStats[5] / total) * 100).toFixed(1)}%)`);
  console.log('='.repeat(60));
  console.log('\n✅ Difficulty assignment completed!');
}

if (require.main === module) {
  main();
}

module.exports = {
  determineDifficulty,
  extractTextFromHtml,
  addDifficultyToQuizFile,
};
