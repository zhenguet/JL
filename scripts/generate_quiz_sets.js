const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const QUIZ_DIR = path.join(BASE_DIR, 'data', 'quiz');
const LESSON_DIR = path.join(BASE_DIR, 'data', 'lesson');

function loadJson(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  // Remove BOM if present
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

function generateVocabQuestions(lessonData, numQuestions = 10) {
  const questions = [];
  const vocabItems = lessonData.filter(
    (item) => ['noun', 'verb', 'other'].includes(item.type)
  );

  if (vocabItems.length < 4) {
    return questions;
  }

  const shuffled = shuffleArray(vocabItems);
  const selected = shuffled.slice(0, Math.min(numQuestions, shuffled.length));

  selected.forEach((item, index) => {
    const questionId = index + 1;
    const rand = Math.random();

    if (rand < 0.4 && item.hiragana) {
      // Type 1: Hiragana -> Meaning
      const options = [item.vi || ''];
      const otherItems = vocabItems.filter((v) => v !== item);
      const shuffledOthers = shuffleArray(otherItems);

      for (const wrongItem of shuffledOthers) {
        if (wrongItem.vi && !options.includes(wrongItem.vi) && options.length < 4) {
          options.push(wrongItem.vi);
        }
      }

      while (options.length < 4) {
        options.push('Không xác định');
      }

      shuffleArray(options);
      const correctIdx = options.indexOf(item.vi || '');

      questions.push({
        id: questionId,
        question: `<b>${item.hiragana}</b>`,
        options: options,
        correctAnswer: correctIdx >= 0 ? correctIdx : 0,
      });
    } else if (rand < 0.7 && item.vi) {
      // Type 2: Meaning -> Hiragana
      const options = [item.hiragana || ''];
      const otherItems = vocabItems.filter((v) => v !== item && v.hiragana);
      const shuffledOthers = shuffleArray(otherItems);

      for (const wrongItem of shuffledOthers) {
        if (wrongItem.hiragana && !options.includes(wrongItem.hiragana) && options.length < 4) {
          options.push(wrongItem.hiragana);
        }
      }

      while (options.length < 4) {
        options.push('???');
      }

      shuffleArray(options);
      const correctIdx = options.indexOf(item.hiragana || '');

      questions.push({
        id: questionId,
        question: `<b>${item.vi}</b>`,
        options: options,
        correctAnswer: correctIdx >= 0 ? correctIdx : 0,
      });
    } else if (item.kanji && rand < 0.9) {
      // Type 3: Kanji -> Hiragana
      const options = [item.hiragana || ''];
      const otherItems = vocabItems.filter((v) => v !== item && v.hiragana);
      const shuffledOthers = shuffleArray(otherItems);

      for (const wrongItem of shuffledOthers) {
        if (wrongItem.hiragana && !options.includes(wrongItem.hiragana) && options.length < 4) {
          options.push(wrongItem.hiragana);
        }
      }

      while (options.length < 4) {
        options.push('???');
      }

      shuffleArray(options);
      const correctIdx = options.indexOf(item.hiragana || '');

      questions.push({
        id: questionId,
        question: `<b>${item.kanji}</b>`,
        options: options,
        correctAnswer: correctIdx >= 0 ? correctIdx : 0,
      });
    }
  });

  return questions.slice(0, numQuestions);
}

function generateGrammarQuestions(lessonData, existingQuiz, numQuestions = 10) {
  const questions = [];
  const grammarPatterns = existingQuiz.filter((q) =>
    q.question && q.question.includes('（　）')
  );

  if (grammarPatterns.length === 0) {
    return questions;
  }

  const shuffled = shuffleArray(grammarPatterns);
  const selected = shuffled.slice(0, Math.min(numQuestions, shuffled.length));

  selected.forEach((pattern, index) => {
    questions.push({
      ...pattern,
      id: index + 1,
    });
  });

  return questions.slice(0, numQuestions);
}

function generateConversationQuestions(lessonData, numQuestions = 5) {
  const questions = [];
  const vocabItems = lessonData.filter(
    (item) => ['noun', 'verb', 'other'].includes(item.type)
  );

  if (vocabItems.length < 2) {
    return questions;
  }

  const patterns = [
    {
      template: (vocab1) =>
        `<b>A：${vocab1}は　どこですか。<p>B：（　）です。</p></b>`,
      options: ['ここ', 'そこ', 'あそこ', 'どこ'],
      correctAnswers: [0, 1, 2],
    },
    {
      template: (vocab1) =>
        `<b>A：${vocab1}は　どちらですか。<p>B：（　）です。</p></b>`,
      options: ['こちら', 'そちら', 'あちら', 'どちら'],
      correctAnswers: [0, 1, 2],
    },
    {
      template: (vocab1, vocab2) =>
        `<b>A：これは　なんですか。<p>B：（　）は　${vocab2}です。</p></b>`,
      options: ['それ', 'これ', 'あれ', 'どれ'],
      correctAnswers: [1],
    },
  ];

  for (let i = 0; i < Math.min(numQuestions, patterns.length * 3); i++) {
    const pattern = patterns[i % patterns.length];
    const vocab1 = vocabItems[Math.floor(Math.random() * vocabItems.length)];
    const vocab2 =
      pattern.template.length > 1
        ? vocabItems[Math.floor(Math.random() * vocabItems.length)]
        : null;

    const questionText = vocab2
      ? pattern.template(vocab1.hiragana || '', vocab2.hiragana || '')
      : pattern.template(vocab1.hiragana || '');
    const correctAnswer =
      pattern.correctAnswers[
        Math.floor(Math.random() * pattern.correctAnswers.length)
      ];

    questions.push({
      id: i + 1,
      question: questionText,
      options: [...pattern.options],
      correctAnswer: correctAnswer,
    });
  }

  return questions;
}

function generateQuizSet(lessonNumber, setNumber, lessonData, existingQuiz) {
  const questions = [];

  const vocabQuestions = generateVocabQuestions(lessonData, 12);
  const grammarQuestions = generateGrammarQuestions(lessonData, existingQuiz, 8);
  const conversationQuestions = generateConversationQuestions(lessonData, 5);

  let allQuestions = [...vocabQuestions, ...grammarQuestions, ...conversationQuestions];
  allQuestions = shuffleArray(allQuestions);

  while (allQuestions.length < 20 && vocabQuestions.length > 0) {
    const extra = generateVocabQuestions(lessonData, 5);
    allQuestions.push(...extra);
  }

  const finalQuestions = allQuestions.slice(0, 25);
  finalQuestions.forEach((q, i) => {
    q.id = i + 1;
  });

  return finalQuestions;
}

function main() {
  const lessonsToProcess = [];
  
  // Generate for lessons 3-5 (already partially done)
  lessonsToProcess.push([3, [4, 5, 6, 7, 8, 9, 10]]);
  lessonsToProcess.push([4, [2, 3, 4, 5, 6, 7, 8, 9, 10]]);
  lessonsToProcess.push([5, [2, 3, 4, 5, 6, 7, 8, 9, 10]]);
  
  // Generate for lessons 6-50 (set 2-10 for each)
  for (let lessonNum = 6; lessonNum <= 50; lessonNum++) {
    lessonsToProcess.push([lessonNum, [2, 3, 4, 5, 6, 7, 8, 9, 10]]);
  }

  for (const [lessonNum, setNumbers] of lessonsToProcess) {
    const lessonFile = path.join(LESSON_DIR, `lesson${lessonNum}.json`);
    if (!fs.existsSync(lessonFile)) {
      console.log(`Warning: ${lessonFile} not found, skipping lesson ${lessonNum}`);
      continue;
    }

    const lessonData = loadJson(lessonFile);

    const existingQuizFile = path.join(QUIZ_DIR, `quiz${lessonNum}.json`);
    let existingQuiz = [];
    if (fs.existsSync(existingQuizFile)) {
      existingQuiz = loadJson(existingQuizFile);
    }

    for (const setNum of setNumbers) {
      const outputFile = path.join(QUIZ_DIR, `quiz${lessonNum}_set${setNum}.json`);

      if (fs.existsSync(outputFile)) {
        console.log(`Skipping ${path.basename(outputFile)} (already exists)`);
        continue;
      }

      console.log(`Generating ${path.basename(outputFile)}...`);
      const quizSet = generateQuizSet(lessonNum, setNum, lessonData, existingQuiz);

      if (quizSet && quizSet.length > 0) {
        saveJson(outputFile, quizSet);
        console.log(`✓ Created ${path.basename(outputFile)} with ${quizSet.length} questions`);
      } else {
        console.log(`✗ Failed to generate ${path.basename(outputFile)}`);
      }
    }
  }

  console.log('\nDone! All quiz sets have been generated.');
}

main();
