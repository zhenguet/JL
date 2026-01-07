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

function extractTextFromHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/（　）/g, '').trim();
}

function analyzeQuiz(quizData, fileName) {
  const stats = {
    totalQuestions: quizData.length,
    questionsWith2Options: 0,
    questionsWith4Options: 0,
    selfAnsweringQuestions: 0,
    invalidQuestions: 0,
    duplicateOptions: 0,
    placeholderOptions: 0,
  };

  quizData.forEach((question) => {
    // Count options
    if (question.options.length === 2) {
      stats.questionsWith2Options++;
    } else if (question.options.length === 4) {
      stats.questionsWith4Options++;
    }

    // Check for duplicate options
    const uniqueOptions = new Set(question.options.map((opt) => opt.toLowerCase().trim()));
    if (uniqueOptions.size < question.options.length) {
      stats.duplicateOptions++;
    }

    // Check for placeholder values
    const placeholderValues = ['???', 'Không xác định', '...'];
    if (question.options.some((opt) => placeholderValues.includes(opt))) {
      stats.placeholderOptions++;
    }

    // Check for self-answering (simple vocabulary questions where question = answer)
    const questionText = extractTextFromHtml(question.question);
    if (!questionText.includes('（　）') && !questionText.includes('A：') && !questionText.includes('B：')) {
      // Simple vocabulary question
      const correctOption = question.options[question.correctAnswer];
      if (correctOption && questionText.trim() === correctOption.trim()) {
        stats.selfAnsweringQuestions++;
      }
    }

    // Check for invalid patterns
    if (questionText.includes('は　どこですか') && !questionText.includes('（　）')) {
      const match = questionText.match(/^([^は]+)は/);
      if (match) {
        const word = match[1].trim();
        const invalidWords = ['あります', 'います', 'です', 'でした', 'でしたか'];
        if (invalidWords.includes(word)) {
          stats.invalidQuestions++;
        }
      }
    }
  });

  return stats;
}

function main() {
  const files = fs.readdirSync(QUIZ_DIR);
  const quizFiles = files.filter((f) => f.startsWith('quiz') && f.endsWith('.json'));

  console.log(`Analyzing ${quizFiles.length} quiz files...\n`);

  const totalStats = {
    totalFiles: quizFiles.length,
    totalQuestions: 0,
    questionsWith2Options: 0,
    questionsWith4Options: 0,
    selfAnsweringQuestions: 0,
    invalidQuestions: 0,
    duplicateOptions: 0,
    placeholderOptions: 0,
  };

  const filesWithIssues = [];

  quizFiles.forEach((file) => {
    const filePath = path.join(QUIZ_DIR, file);
    try {
      const quizData = loadJson(filePath);
      const stats = analyzeQuiz(quizData, file);

      totalStats.totalQuestions += stats.totalQuestions;
      totalStats.questionsWith2Options += stats.questionsWith2Options;
      totalStats.questionsWith4Options += stats.questionsWith4Options;
      totalStats.selfAnsweringQuestions += stats.selfAnsweringQuestions;
      totalStats.invalidQuestions += stats.invalidQuestions;
      totalStats.duplicateOptions += stats.duplicateOptions;
      totalStats.placeholderOptions += stats.placeholderOptions;

      if (
        stats.selfAnsweringQuestions > 0 ||
        stats.invalidQuestions > 0 ||
        stats.duplicateOptions > 0 ||
        stats.placeholderOptions > 0
      ) {
        filesWithIssues.push({ file, stats });
      }
    } catch (error) {
      console.error(`Error reading ${file}: ${error.message}`);
    }
  });

  console.log('='.repeat(70));
  console.log('QUIZ QUALITY REPORT');
  console.log('='.repeat(70));
  console.log(`Total files analyzed: ${totalStats.totalFiles}`);
  console.log(`Total questions: ${totalStats.totalQuestions}`);
  console.log('\n📊 OPTIONS DISTRIBUTION:');
  console.log(`  Questions with 2 options: ${totalStats.questionsWith2Options} (${((totalStats.questionsWith2Options / totalStats.totalQuestions) * 100).toFixed(1)}%)`);
  console.log(`  Questions with 4 options: ${totalStats.questionsWith4Options} (${((totalStats.questionsWith4Options / totalStats.totalQuestions) * 100).toFixed(1)}%)`);
  console.log(`  Questions with other counts: ${totalStats.totalQuestions - totalStats.questionsWith2Options - totalStats.questionsWith4Options}`);

  console.log('\n⚠️  ISSUES FOUND:');
  console.log(`  Self-answering questions: ${totalStats.selfAnsweringQuestions} (${((totalStats.selfAnsweringQuestions / totalStats.totalQuestions) * 100).toFixed(1)}%)`);
  console.log(`  Invalid question patterns: ${totalStats.invalidQuestions} (${((totalStats.invalidQuestions / totalStats.totalQuestions) * 100).toFixed(1)}%)`);
  console.log(`  Questions with duplicate options: ${totalStats.duplicateOptions} (${((totalStats.duplicateOptions / totalStats.totalQuestions) * 100).toFixed(1)}%)`);
  console.log(`  Questions with placeholder options: ${totalStats.placeholderOptions} (${((totalStats.placeholderOptions / totalStats.totalQuestions) * 100).toFixed(1)}%)`);

  console.log('\n📁 FILES WITH ISSUES:');
  console.log(`  Total: ${filesWithIssues.length} files`);

  if (filesWithIssues.length > 0 && filesWithIssues.length <= 20) {
    console.log('\n  Top files with issues:');
    filesWithIssues
      .sort((a, b) => {
        const aIssues = a.stats.selfAnsweringQuestions + a.stats.invalidQuestions + a.stats.duplicateOptions + a.stats.placeholderOptions;
        const bIssues = b.stats.selfAnsweringQuestions + b.stats.invalidQuestions + b.stats.duplicateOptions + b.stats.placeholderOptions;
        return bIssues - aIssues;
      })
      .slice(0, 10)
      .forEach(({ file, stats }) => {
        const totalIssues = stats.selfAnsweringQuestions + stats.invalidQuestions + stats.duplicateOptions + stats.placeholderOptions;
        console.log(`    ${file}: ${totalIssues} issues (self-answering: ${stats.selfAnsweringQuestions}, invalid: ${stats.invalidQuestions}, duplicates: ${stats.duplicateOptions}, placeholders: ${stats.placeholderOptions})`);
      });
  }

  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY:');
  console.log('='.repeat(70));

  const criticalIssues = totalStats.selfAnsweringQuestions + totalStats.invalidQuestions;
  const totalIssues = criticalIssues + totalStats.duplicateOptions + totalStats.placeholderOptions;

  if (criticalIssues === 0 && totalIssues === 0) {
    console.log('✅ All quizzes are valid!');
  } else if (criticalIssues === 0) {
    console.log('✅ No critical issues. Some minor issues (duplicates, placeholders) may need review.');
  } else {
    console.log(`⚠️  Found ${criticalIssues} critical issues that should be fixed.`);
    console.log(`   - Self-answering questions: ${totalStats.selfAnsweringQuestions}`);
    console.log(`   - Invalid question patterns: ${totalStats.invalidQuestions}`);
  }

  console.log('\n📝 NOTES:');
  console.log('  - Questions with 2 options are common for grammar questions (e.g., は/が, に/で)');
  console.log('  - Self-answering questions occur when question text matches the correct answer');
  console.log('  - Invalid patterns include questions like "A：ありますは　どこですか"');
}

main();
