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

function validateQuiz(quizData, fileName) {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(quizData)) {
    errors.push(`${fileName}: Quiz data is not an array`);
    return { errors, warnings };
  }

  if (quizData.length === 0) {
    warnings.push(`${fileName}: Quiz is empty`);
    return { errors, warnings };
  }

  quizData.forEach((question, index) => {
    const qNum = index + 1;

    // Check required fields
    if (!question.id) {
      errors.push(`${fileName} Q${qNum}: Missing id`);
    }
    if (!question.question) {
      errors.push(`${fileName} Q${qNum}: Missing question`);
    }
    if (!question.options || !Array.isArray(question.options)) {
      errors.push(`${fileName} Q${qNum}: Missing or invalid options`);
      return;
    }
    if (typeof question.correctAnswer !== 'number') {
      errors.push(`${fileName} Q${qNum}: Missing or invalid correctAnswer`);
      return;
    }

    // Check options count
    if (question.options.length < 2) {
      errors.push(`${fileName} Q${qNum}: Only ${question.options.length} option(s), need at least 2`);
    } else if (question.options.length < 4) {
      warnings.push(`${fileName} Q${qNum}: Only ${question.options.length} options (prefer 4)`);
    }

    // Check correctAnswer is valid
    if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
      errors.push(
        `${fileName} Q${qNum}: correctAnswer (${question.correctAnswer}) is out of range (0-${question.options.length - 1})`
      );
    }

    // Check for duplicate options
    const uniqueOptions = new Set(question.options);
    if (uniqueOptions.size < question.options.length) {
      warnings.push(`${fileName} Q${qNum}: Has duplicate options`);
    }

    // Check for empty options
    question.options.forEach((opt, optIndex) => {
      if (!opt || opt.trim() === '') {
        warnings.push(`${fileName} Q${qNum}: Option ${optIndex + 1} is empty`);
      }
    });

    // Check for placeholder values
    const placeholderValues = ['???', 'Không xác định', '...'];
    question.options.forEach((opt, optIndex) => {
      if (placeholderValues.includes(opt)) {
        warnings.push(`${fileName} Q${qNum}: Option ${optIndex + 1} contains placeholder value: "${opt}"`);
      }
    });

    // Check ID consistency
    if (question.id !== qNum) {
      warnings.push(`${fileName} Q${qNum}: ID mismatch (expected ${qNum}, got ${question.id})`);
    }
  });

  return { errors, warnings };
}

function main() {
  const files = fs.readdirSync(QUIZ_DIR);
  const quizFiles = files.filter((f) => f.startsWith('quiz') && f.endsWith('.json'));

  const allErrors = [];
  const allWarnings = [];
  let totalQuestions = 0;
  let filesWithIssues = 0;

  console.log(`Validating ${quizFiles.length} quiz files...\n`);

  quizFiles.forEach((file) => {
    const filePath = path.join(QUIZ_DIR, file);
    try {
      const quizData = loadJson(filePath);
      const { errors, warnings } = validateQuiz(quizData, file);

      if (errors.length > 0 || warnings.length > 0) {
        filesWithIssues++;
      }

      allErrors.push(...errors);
      allWarnings.push(...warnings);
      totalQuestions += quizData.length;
    } catch (error) {
      allErrors.push(`${file}: Failed to parse JSON - ${error.message}`);
      filesWithIssues++;
    }
  });

  // Print summary
  console.log('='.repeat(60));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files: ${quizFiles.length}`);
  console.log(`Files with issues: ${filesWithIssues}`);
  console.log(`Total questions: ${totalQuestions}`);
  console.log(`Total errors: ${allErrors.length}`);
  console.log(`Total warnings: ${allWarnings.length}`);
  console.log('='.repeat(60));

  if (allErrors.length > 0) {
    console.log('\n❌ ERRORS (must fix):');
    console.log('-'.repeat(60));
    allErrors.slice(0, 50).forEach((error) => {
      console.log(`  ${error}`);
    });
    if (allErrors.length > 50) {
      console.log(`  ... and ${allErrors.length - 50} more errors`);
    }
  }

  if (allWarnings.length > 0) {
    console.log('\n⚠️  WARNINGS (should fix):');
    console.log('-'.repeat(60));
    allWarnings.slice(0, 50).forEach((warning) => {
      console.log(`  ${warning}`);
    });
    if (allWarnings.length > 50) {
      console.log(`  ... and ${allWarnings.length - 50} more warnings`);
    }
  }

  if (allErrors.length === 0 && allWarnings.length === 0) {
    console.log('\n✅ All quizzes are valid!');
  } else if (allErrors.length === 0) {
    console.log('\n✅ No critical errors, but some warnings to review.');
  } else {
    console.log('\n❌ Found critical errors that need to be fixed.');
    process.exit(1);
  }
}

main();
