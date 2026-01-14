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
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/（　）/g, '')
    .replace(/ruby|rp|rt/g, '')
    .trim();
}

function checkLogicIssues(quizData, fileName) {
  const issues = [];

  quizData.forEach((question, index) => {
    const qNum = index + 1;
    const questionText = extractTextFromHtml(question.question);

    // Check if question text appears in options (self-answering question)
    const questionInOptions = question.options.some((opt) => {
      const optText = opt.trim();
      const qText = questionText.trim();
      return optText === qText || optText.includes(qText) || qText.includes(optText);
    });

    if (questionInOptions) {
      issues.push({
        type: 'self-answering',
        file: fileName,
        question: qNum,
        questionText: questionText,
        options: question.options,
      });
    }

    // Check for invalid question patterns
    if (questionText.includes('は　どこですか') && !questionText.includes('（　）')) {
      const match = questionText.match(/^[^は]+は/);
      if (match) {
        const word = match[0].replace('は', '').trim();
        // Check if it's a valid vocabulary word (not a grammar word like あります)
        const invalidWords = ['あります', 'います', 'です', 'でした', 'でしたか'];
        if (invalidWords.includes(word)) {
          issues.push({
            type: 'invalid-pattern',
            file: fileName,
            question: qNum,
            questionText: questionText,
            reason: `Invalid word "${word}" in question pattern`,
          });
        }
      }
    }

    // Check if correct answer matches question text
    const correctOption = question.options[question.correctAnswer];
    if (correctOption && questionText.includes(correctOption.trim())) {
      issues.push({
        type: 'question-contains-answer',
        file: fileName,
        question: qNum,
        questionText: questionText,
        correctAnswer: correctOption,
      });
    }
  });

  return issues;
}

function main() {
  const files = fs.readdirSync(QUIZ_DIR);
  const quizFiles = files.filter((f) => f.startsWith('quiz') && f.endsWith('.json'));

  console.log(`Checking logic issues in ${quizFiles.length} quiz files...\n`);

  const allIssues = [];

  quizFiles.forEach((file) => {
    const filePath = path.join(QUIZ_DIR, file);
    try {
      const quizData = loadJson(filePath);
      const issues = checkLogicIssues(quizData, file);
      allIssues.push(...issues);
    } catch (error) {
      console.error(`Error reading ${file}: ${error.message}`);
    }
  });

  console.log('='.repeat(60));
  console.log('LOGIC ISSUES SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total files checked: ${quizFiles.length}`);
  console.log(`Total issues found: ${allIssues.length}`);

  const byType = {};
  allIssues.forEach((issue) => {
    byType[issue.type] = (byType[issue.type] || 0) + 1;
  });

  console.log('\nIssues by type:');
  Object.keys(byType).forEach((type) => {
    console.log(`  ${type}: ${byType[type]}`);
  });

  if (allIssues.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('DETAILED ISSUES');
    console.log('='.repeat(60));

    allIssues.slice(0, 30).forEach((issue) => {
      console.log(`\n[${issue.type.toUpperCase()}] ${issue.file} Q${issue.question}`);
      console.log(`  Question: ${issue.questionText}`);
      if (issue.options) {
        console.log(`  Options: ${issue.options.join(', ')}`);
      }
      if (issue.correctAnswer) {
        console.log(`  Correct Answer: ${issue.correctAnswer}`);
      }
      if (issue.reason) {
        console.log(`  Reason: ${issue.reason}`);
      }
    });

    if (allIssues.length > 30) {
      console.log(`\n... and ${allIssues.length - 30} more issues`);
    }
  } else {
    console.log('\n✅ No logic issues found!');
  }
}

main();
