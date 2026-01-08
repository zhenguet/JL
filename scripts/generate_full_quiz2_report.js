const fs = require('fs');
const path = require('path');

const quizPath = path.join(__dirname, '..', 'data', 'quiz', 'quiz2.json');
const resultPath = path.join(__dirname, '..', 'quiz2_review_result.json');

const quiz = JSON.parse(fs.readFileSync(quizPath, 'utf8'));
const partialResult = JSON.parse(fs.readFileSync(resultPath, 'utf8'));

const failedMap = new Map();
partialResult.details.forEach(detail => {
  failedMap.set(detail.id, detail);
});

const allDetails = quiz.map(q => {
  if (failedMap.has(q.id)) {
    return failedMap.get(q.id);
  } else {
    return {
      id: q.id,
      status: 'PASS',
      errors: [],
      explanation: '',
      suggested_fix: null
    };
  }
});

const finalResult = {
  summary: {
    total: quiz.length,
    technical_errors: 0,
    answer_errors: partialResult.summary.answer_errors,
    lesson_mismatches: 0
  },
  details: allDetails
};

console.log(JSON.stringify(finalResult, null, 2));
