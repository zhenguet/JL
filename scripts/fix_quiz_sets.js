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

function getAdditionalOptions(lessonData, currentOptions, numNeeded) {
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
  }

  return additionalOptions;
}

function fixQuizFile(filePath, lessonData) {
  const quizData = loadJson(filePath);
  let fixed = false;
  const placeholderValues = ['???', 'Không xác định', '...'];

  const fixedQuiz = quizData.map((question, index) => {
    const fixedQuestion = { ...question };
    fixedQuestion.id = index + 1;

    // Remove placeholder values
    const hasPlaceholder = fixedQuestion.options.some((opt) =>
      placeholderValues.includes(opt)
    );

    if (hasPlaceholder && lessonData) {
      const validOptions = fixedQuestion.options.filter(
        (opt) => !placeholderValues.includes(opt)
      );
      const needed = 4 - validOptions.length;
      if (needed > 0) {
        const additional = getAdditionalOptions(lessonData, validOptions, needed);
        fixedQuestion.options = [...validOptions, ...additional];
        fixed = true;
      }
    }

    // Fix questions with only 2 options (grammar questions) - keep as is if they're valid
    // But ensure they have at least 2 valid options
    fixedQuestion.options = fixedQuestion.options.filter(
      (opt) => opt && opt.trim() !== '' && !placeholderValues.includes(opt)
    );

    // Ensure correctAnswer is still valid
    if (fixedQuestion.correctAnswer >= fixedQuestion.options.length) {
      fixedQuestion.correctAnswer = 0;
      fixed = true;
    }

    // Remove duplicates while preserving order
    const seen = new Set();
    fixedQuestion.options = fixedQuestion.options.filter((opt) => {
      const key = opt.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    // Ensure at least 2 options
    if (fixedQuestion.options.length < 2) {
      if (lessonData) {
        const additional = getAdditionalOptions(lessonData, fixedQuestion.options, 2);
        fixedQuestion.options = [...fixedQuestion.options, ...additional];
        fixed = true;
      }
    }

    // Re-validate correctAnswer
    if (fixedQuestion.correctAnswer >= fixedQuestion.options.length) {
      fixedQuestion.correctAnswer = 0;
      fixed = true;
    }

    return fixedQuestion;
  });

  // Remove duplicate questions
  const seenQuestions = new Set();
  const uniqueQuestions = fixedQuiz.filter((q) => {
    const key = q.question.toLowerCase().trim();
    if (seenQuestions.has(key)) {
      return false;
    }
    seenQuestions.add(key);
    return true;
  });

  if (uniqueQuestions.length !== fixedQuiz.length) {
    fixed = true;
  }

  // Re-assign IDs
  uniqueQuestions.forEach((q, i) => {
    q.id = i + 1;
  });

  if (fixed) {
    saveJson(filePath, uniqueQuestions);
    return true;
  }

  return false;
}

function main() {
  const files = fs.readdirSync(QUIZ_DIR);
  const quizFiles = files.filter((f) => f.startsWith('quiz') && f.endsWith('.json'));

  console.log(`Fixing ${quizFiles.length} quiz files...\n`);

  let fixedCount = 0;
  let errorCount = 0;

  // Group by lesson number to load lesson data once per lesson
  const lessonMap = {};
  quizFiles.forEach((file) => {
    const match = file.match(/quiz(\d+)\.json/);
    if (match) {
      const lessonNum = parseInt(match[1], 10);
      lessonMap[lessonNum] = file;
    }
  });

  quizFiles.forEach((file, index) => {
    const match = file.match(/quiz(\d+)(_set(\d+))?\.json/);
    if (!match) return;

    const lessonNum = parseInt(match[1], 10);
    const lessonFile = path.join(LESSON_DIR, `lesson${lessonNum}.json`);

    let lessonData = null;
    if (fs.existsSync(lessonFile)) {
      try {
        lessonData = loadJson(lessonFile);
      } catch (e) {
        // Ignore
      }
    }

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
