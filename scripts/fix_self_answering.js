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

function extractTextFromHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/（　）/g, '').trim();
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getAlternativeOptions(lessonData, currentQuestionText, currentOptions, numNeeded) {
  const vocabItems = lessonData.filter(
    (item) => ['noun', 'verb', 'other'].includes(item.type) && item.hiragana
  );

  const additionalOptions = [];
  const usedOptions = new Set(
    [...currentOptions, currentQuestionText].map((opt) => opt.toLowerCase().trim())
  );

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

function fixSelfAnsweringQuestion(question, lessonData) {
  const questionText = extractTextFromHtml(question.question);
  const correctOption = question.options[question.correctAnswer];

  // Check if this is a self-answering question (simple vocabulary question)
  const isSimpleVocabQuestion =
    !question.question.includes('（　）') &&
    !question.question.includes('A：') &&
    !question.question.includes('B：');

  if (!isSimpleVocabQuestion) {
    return question; // Not a simple vocab question, skip
  }

  // Check if question text matches correct answer
  if (questionText.trim() === correctOption.trim()) {
    // This is a self-answering question - need to fix it

    // Strategy 1: If it's a hiragana question, change to meaning question
    // Strategy 2: If it's a meaning question, change to hiragana question
    // Strategy 3: Replace the correct answer with a different option

    // Check if question is hiragana (contains hiragana/katakana characters)
    const hasJapaneseChars = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(questionText);

    if (hasJapaneseChars) {
      // Question is in Japanese, should have meaning as answer
      // But if answer is also Japanese and matches, we need to change the question
      // Try to find the meaning from lesson data
      const vocabItem = lessonData.find(
        (item) =>
          item.hiragana === questionText.trim() ||
          item.kanji === questionText.trim() ||
          item.hiragana === correctOption.trim()
      );

      if (vocabItem && vocabItem.vi) {
        // Change question to meaning, keep Japanese options
        return {
          ...question,
          question: `<b>${vocabItem.vi}</b>`,
        };
      } else {
        // Can't find meaning, remove this question or replace correct answer
        // Replace correct answer with a different option
        const wrongOptions = question.options.filter((opt, idx) => idx !== question.correctAnswer);
        if (wrongOptions.length > 0) {
          const newCorrectIdx = Math.floor(Math.random() * wrongOptions.length);
          const newOptions = [...wrongOptions];
          newOptions.splice(newCorrectIdx, 0, correctOption);
          return {
            ...question,
            options: newOptions,
            correctAnswer: newCorrectIdx,
          };
        }
      }
    } else {
      // Question is in Vietnamese (meaning), should have Japanese as answer
      // But if answer matches question, find the Japanese equivalent
      const vocabItem = lessonData.find(
        (item) => item.vi === questionText.trim() || item.vi === correctOption.trim()
      );

      if (vocabItem && vocabItem.hiragana) {
        // Change correct answer to hiragana if it's not already
        const hiraganaIdx = question.options.findIndex((opt) => opt === vocabItem.hiragana);
        if (hiraganaIdx >= 0 && hiraganaIdx !== question.correctAnswer) {
          return {
            ...question,
            correctAnswer: hiraganaIdx,
          };
        }
      }
    }

    // Last resort: remove the question (return null to filter out)
    return null;
  }

  return question;
}

function fixQuizFile(filePath, lessonData) {
  const quizData = loadJson(filePath);
  let fixed = false;

  const fixedQuestions = quizData
    .map((question) => {
      const fixed = fixSelfAnsweringQuestion(question, lessonData);
      if (fixed === null) {
        // Question was removed
        return null;
      }
      if (JSON.stringify(fixed) !== JSON.stringify(question)) {
        return fixed;
      }
      return question;
    })
    .filter((q) => q !== null);

  // Re-assign IDs
  fixedQuestions.forEach((q, i) => {
    q.id = i + 1;
  });

  if (fixedQuestions.length !== quizData.length) {
    fixed = true;
  } else {
    // Check if any question was actually changed
    for (let i = 0; i < fixedQuestions.length; i++) {
      if (JSON.stringify(fixedQuestions[i]) !== JSON.stringify(quizData[i])) {
        fixed = true;
        break;
      }
    }
  }

  if (fixed) {
    saveJson(filePath, fixedQuestions);
    return { fixed: true, removed: quizData.length - fixedQuestions.length };
  }

  return { fixed: false, removed: 0 };
}

function main() {
  const files = fs.readdirSync(QUIZ_DIR);
  const quizFiles = files.filter((f) => f.startsWith('quiz') && f.endsWith('.json'));

  console.log(`Fixing self-answering questions in ${quizFiles.length} quiz files...\n`);

  let fixedCount = 0;
  let errorCount = 0;
  let totalRemoved = 0;

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
      const result = fixQuizFile(filePath, lessonData);
      if (result.fixed) {
        fixedCount++;
        totalRemoved += result.removed;
        if (fixedCount % 50 === 0) {
          console.log(`  Fixed ${fixedCount} files... (removed ${totalRemoved} questions)`);
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
  console.log(`Questions removed: ${totalRemoved}`);
  console.log(`Errors: ${errorCount}`);
  console.log('='.repeat(60));

  if (errorCount === 0) {
    console.log('\n✅ All files processed successfully!');
  } else {
    console.log(`\n⚠️  ${errorCount} files had errors.`);
  }
}

main();
