const fs = require('fs');
const path = require('path');

const lessonFile = path.join(__dirname, '..', 'data', 'lesson', 'lesson3.json');
const quizFile = path.join(__dirname, '..', 'data', 'quiz', 'quiz3.json');

const lessonData = JSON.parse(fs.readFileSync(lessonFile, 'utf-8'));
const quizData = JSON.parse(fs.readFileSync(quizFile, 'utf-8'));

const lessonVocab = new Set();
const lessonVocabMap = new Map();
lessonData.forEach(item => {
  if (item.hiragana) {
    lessonVocab.add(item.hiragana);
    lessonVocabMap.set(item.hiragana, item);
  }
  if (item.kanji && item.kanji.trim()) {
    const kanji = item.kanji.replace(/～/g, '').trim();
    if (kanji) {
      lessonVocab.add(kanji);
      lessonVocabMap.set(kanji, item);
    }
  }
});

const commonWords = new Set(['です', 'ですか', 'は', 'が', 'を', 'に', 'で', 'から', 'の', 'も', 'と', 'や', 'か', 'ね', 'よ', 'さん', 'ちゃん', 'くん', 'じん', 'さい', 'なん', 'だれ', 'どなた', 'おいくつ', 'なんさい', 'どちら', 'どこ', 'いつ', 'どう', 'どんな', 'これ', 'それ', 'あれ', 'この', 'その', 'あの', 'どの', 'どれ', 'はい', 'いいえ', 'わたし', 'あなた', 'あのひと', 'あのかた', 'みなさん', 'はじめまして', 'どうぞよろしく', 'おなまえは', 'しつれいですが', 'こちらは', 'からきました', 'じゃ', 'でも', 'そして', 'しかし', 'でも', 'から', 'まで', 'へ', 'と', 'どうぞ', 'ください', 'すみません', 'ありがとう', 'どういたしまして', 'どうぞ', 'お願いします', '見せてください']);

function extractJapaneseWords(text) {
  if (!text) return new Set();
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/<ruby>.*?<\/ruby>/g, '');
  text = text.replace(/<rp>.*?<\/rp>/g, '');
  text = text.replace(/<rt>.*?<\/rt>/g, '');
  const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]+/g;
  const matches = text.match(japanesePattern) || [];
  return new Set(matches.filter(word => word.length > 0));
}

function isWordInLesson(word, lessonVocab, commonWords) {
  if (word.length <= 1) return true;
  const wordClean = word.trim().replace(/[？。、]/g, '');
  if (!wordClean) return true;
  if (/^[0-9]+$/.test(wordClean)) return true;
  
  if (lessonVocab.has(wordClean) || commonWords.has(wordClean)) return true;
  
  for (const vocabWord of lessonVocab) {
    if (wordClean.includes(vocabWord) || vocabWord.includes(wordClean)) {
      return true;
    }
  }
  
  for (const commonWord of commonWords) {
    if (wordClean.includes(commonWord) || commonWord.includes(wordClean)) {
      return true;
    }
  }
  
  return false;
}

function checkQuiz(quizData, lessonVocab, commonWords) {
  const results = [];
  const seenIds = new Set();
  const seenQuestions = new Set();
  let technicalErrors = 0;
  let answerErrors = 0;
  let lessonMismatches = 0;

  quizData.forEach((item, index) => {
    const errors = [];
    const qNum = index + 1;
    let explanation = "";
    let suggestedFix = null;

    if (!item.id || seenIds.has(item.id)) {
      errors.push('technical_error');
      technicalErrors++;
      explanation += "ID trung lap hoac khong hop le. ";
    }
    seenIds.add(item.id);

    if (!item.question || item.question.trim() === '') {
      errors.push('technical_error');
      technicalErrors++;
      explanation += "Question rong. ";
    }

    if (!item.options || !Array.isArray(item.options) || item.options.length < 2) {
      errors.push('technical_error');
      technicalErrors++;
      explanation += "Options khong hop le hoac it hon 2. ";
    }

    if (item.options) {
      const uniqueOptions = new Set(item.options.map(o => o.trim()));
      if (uniqueOptions.size < item.options.length) {
        errors.push('technical_error');
        technicalErrors++;
        explanation += "Options trung lap. ";
      }
    }

    if (typeof item.correctAnswer !== 'number' || item.correctAnswer < 0 || item.correctAnswer >= (item.options ? item.options.length : 0)) {
      errors.push('technical_error');
      technicalErrors++;
      explanation += "correctAnswer khong hop le. ";
    }

    const questionText = item.question ? item.question.replace(/<[^>]+>/g, '').replace(/<ruby>.*?<\/ruby>/g, '').trim() : '';
    if (questionText && seenQuestions.has(questionText)) {
      errors.push('technical_error');
      technicalErrors++;
      explanation += "Question trung lap. ";
    }
    if (questionText) seenQuestions.add(questionText);

    if (typeof item.difficulty !== 'number' || item.difficulty <= 0) {
      errors.push('technical_error');
      technicalErrors++;
      explanation += "Difficulty khong hop le. ";
    }

    if (item.question && item.options && item.correctAnswer >= 0 && item.correctAnswer < item.options.length) {
      const questionWords = extractJapaneseWords(item.question);
      const optionWords = new Set();
      item.options.forEach(opt => {
        extractJapaneseWords(opt).forEach(w => optionWords.add(w));
      });

      const allWords = new Set([...questionWords, ...optionWords]);
      const unknownWords = [];
      allWords.forEach(word => {
        if (!isWordInLesson(word, lessonVocab, commonWords)) {
          unknownWords.push(word);
        }
      });

      if (unknownWords.length > 0) {
        errors.push('lesson_mismatch');
        lessonMismatches++;
        explanation += `Tu vung vuot bai: ${unknownWords.slice(0, 5).join(', ')}. `;
      }

      const correctValue = item.options[item.correctAnswer];
      const cleanQuestion = item.question.replace(/<[^>]+>/g, '').replace(/<ruby>.*?<\/ruby>/g, '').replace(/<rp>.*?<\/rp>/g, '').replace(/<rt>.*?<\/rt>/g, '');

      if (correctValue && cleanQuestion.includes(correctValue.trim())) {
        errors.push('answer_error');
        answerErrors++;
        explanation += "Dap an xuat hien trong cau hoi. ";
      }
    }

    if (errors.length === 0) {
      results.push({
        id: item.id,
        status: "PASS",
        errors: [],
        explanation: "",
        suggested_fix: null
      });
    } else {
      results.push({
        id: item.id,
        status: "FAIL",
        errors: errors,
        explanation: explanation.trim(),
        suggested_fix: null
      });
    }
  });

  return {
    summary: {
      total: quizData.length,
      technical_errors: technicalErrors,
      answer_errors: answerErrors,
      lesson_mismatches: lessonMismatches
    },
    details: results
  };
}

const result = checkQuiz(quizData, lessonVocab, commonWords);
console.log(JSON.stringify(result, null, 2));
