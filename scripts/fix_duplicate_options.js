const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const QUIZ_DIR = path.join(BASE_DIR, 'data', 'quiz');
const LESSON_DIR = path.join(BASE_DIR, 'data', 'lesson');

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

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getAlternativeOptions(lessonData, currentOptions, numNeeded) {
  const vocabItems = lessonData.filter(
    (item) => ['noun', 'verb', 'other'].includes(item.type) && item.hiragana
  );

  const additionalOptions = [];
  const usedOptions = new Set(currentOptions.map((opt) => opt.toLowerCase().trim()));

  for (const item of shuffleArray(vocabItems)) {
    if (additionalOptions.length >= numNeeded) break;

    // Try hiragana first
    if (item.hiragana && !usedOptions.has(item.hiragana.toLowerCase().trim())) {
      additionalOptions.push(item.hiragana);
      usedOptions.add(item.hiragana.toLowerCase().trim());
      continue;
    }

    // Try meaning
    if (item.vi && !usedOptions.has(item.vi.toLowerCase().trim())) {
      additionalOptions.push(item.vi);
      usedOptions.add(item.vi.toLowerCase().trim());
      continue;
    }

    // Try kanji
    if (item.kanji && !usedOptions.has(item.kanji.toLowerCase().trim())) {
      additionalOptions.push(item.kanji);
      usedOptions.add(item.kanji.toLowerCase().trim());
      continue;
    }
  }

  return additionalOptions;
}

function fixDuplicateOptions(question, lessonData) {
  const seen = new Map();
  const uniqueOptions = [];
  const optionIndices = [];

  question.options.forEach((opt, idx) => {
    const key = opt.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.set(key, true);
      uniqueOptions.push(opt);
      optionIndices.push(idx);
    }
  });

  if (uniqueOptions.length === question.options.length) {
    return question; // No duplicates
  }

  // Found duplicates - need to replace them
  const fixedQuestion = { ...question };
  fixedQuestion.options = uniqueOptions;

  // Update correctAnswer if needed
  const originalCorrectIdx = optionIndices.indexOf(question.correctAnswer);
  if (originalCorrectIdx >= 0) {
    fixedQuestion.correctAnswer = originalCorrectIdx;
  } else {
    // Correct answer was removed, need to find a new one
    // Try to keep the same option if it still exists
    const originalCorrectOption = question.options[question.correctAnswer];
    const newCorrectIdx = uniqueOptions.findIndex(
      (opt) => opt.toLowerCase().trim() === originalCorrectOption.toLowerCase().trim()
    );
    if (newCorrectIdx >= 0) {
      fixedQuestion.correctAnswer = newCorrectIdx;
    } else {
      // Can't find the original correct answer, set to first option
      fixedQuestion.correctAnswer = 0;
    }
  }

  // If we removed options and now have less than 2, add more
  if (fixedQuestion.options.length < 2 && lessonData) {
    const needed = 2 - fixedQuestion.options.length;
    const additional = getAlternativeOptions(lessonData, fixedQuestion.options, needed);
    fixedQuestion.options = [...fixedQuestion.options, ...additional];
  }

  // Ensure correctAnswer is still valid
  if (fixedQuestion.correctAnswer >= fixedQuestion.options.length) {
    fixedQuestion.correctAnswer = 0;
  }

  return fixedQuestion;
}

function fixQuizFile(filePath, lessonData) {
  const quizData = loadJson(filePath);
  let fixed = false;

  const fixedQuestions = quizData.map((question) => {
    const fixed = fixDuplicateOptions(question, lessonData);
    if (JSON.stringify(fixed) !== JSON.stringify(question)) {
      return fixed;
    }
    return question;
  });

  // Re-assign IDs
  fixedQuestions.forEach((q, i) => {
    q.id = i + 1;
  });

  // Check if any question was actually changed
  for (let i = 0; i < fixedQuestions.length; i++) {
    if (JSON.stringify(fixedQuestions[i]) !== JSON.stringify(quizData[i])) {
      fixed = true;
      break;
    }
  }

  if (fixed) {
    saveJson(filePath, fixedQuestions);
    return true;
  }

  return false;
}

function main() {
  const files = fs.readdirSync(QUIZ_DIR);
  const quizFiles = files.filter((f) => f.startsWith('quiz') && f.endsWith('.json'));

  console.log(`Fixing duplicate options in ${quizFiles.length} quiz files...\n`);

  let fixedCount = 0;
  let errorCount = 0;

  // Group by lesson number to load lesson data once per lesson
  const lessonDataCache = {};

  quizFiles.forEach((file, index) => {
    const match = file.match(/quiz(\d+)(_set(\d+))?\.json/);
    if (!match) return;

    const lessonNum = parseInt(match[1], 10);

    // Load lesson data if not cached
    if (!lessonDataCache[lessonNum]) {
      const lessonFile = path.join(LESSON_DIR, `lesson${lessonNum}.json`);
      if (fs.existsSync(lessonFile)) {
        try {
          lessonDataCache[lessonNum] = loadJson(lessonFile);
        } catch (e) {
          // Ignore
        }
      }
    }

    const lessonData = lessonDataCache[lessonNum] || [];

    const filePath = path.join(QUIZ_DIR, file);
    try {
      const wasFixed = fixQuizFile(filePath, lessonData);
      if (wasFixed) {
        fixedCount++;
        if (fixedCount % 50 === 0) {
          console.log(`  Fixed ${fixedCount} files...`);
        }
      }
    } catch (error) {
      errorCount++;
      console.error(`  Error fixing ${file}: ${error.message}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('FIX SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files: ${quizFiles.length}`);
  console.log(`Files fixed: ${fixedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log('='.repeat(60));

  if (errorCount === 0) {
    console.log('\n✅ All files processed successfully!');
  } else {
    console.log(`\n⚠️  ${errorCount} files had errors.`);
  }
}

main();
