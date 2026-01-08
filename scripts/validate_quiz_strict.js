const fs = require('fs');
const path = require('path');

const lessonFile = path.join(__dirname, '..', 'data', 'lesson', 'lesson3.json');
const quizFile = path.join(__dirname, '..', 'data', 'quiz', 'quiz3.json');

const lessonData = JSON.parse(fs.readFileSync(lessonFile, 'utf-8'));
const quizData = JSON.parse(fs.readFileSync(quizFile, 'utf-8'));

const lessonVocab = new Set();
lessonData.forEach(item => {
  if (item.hiragana) lessonVocab.add(item.hiragana);
  if (item.kanji && item.kanji.trim()) {
    const kanji = item.kanji.replace(/～/g, '').trim();
    if (kanji) lessonVocab.add(kanji);
  }
});

const commonWords = new Set(['です', 'ですか', 'は', 'が', 'を', 'に', 'で', 'から', 'の', 'も', 'と', 'や', 'か', 'ね', 'よ', 'さん', 'ちゃん', 'くん', 'じん', 'さい', 'なん', 'だれ', 'どなた', 'おいくつ', 'なんさい', 'どちら', 'どこ', 'いつ', 'どう', 'どんな', 'これ', 'それ', 'あれ', 'この', 'その', 'あの', 'どの', 'どれ', 'はい', 'いいえ', 'わたし', 'あなた', 'あのひと', 'あのかた', 'みなさん', 'はじめまして', 'どうぞよろしく', 'おなまえは', 'しつれいですが', 'こちらは', 'からきました', 'じゃ', 'でも', 'そして', 'しかし', 'でも', 'から', 'まで', 'へ', 'と', 'どうぞ', 'ください', 'すみません', 'ありがとう', 'どういたしまして']);

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

function checkQuiz(quizData, lessonVocab) {
  const results = [];
  const seenIds = new Set();
  const seenQuestions = new Set();
  let technicalErrors = 0;
  let answerErrors = 0;
  let lessonMismatches = 0;

  quizData.forEach((item, index) => {
    const errors = [];
    const qNum = index + 1;

    if (!item.id || seenIds.has(item.id)) {
      errors.push('technical_error');
      technicalErrors++;
    }
    seenIds.add(item.id);

    if (!item.question || item.question.trim() === '') {
      errors.push('technical_error');
      technicalErrors++;
    }

    if (!item.options || !Array.isArray(item.options) || item.options.length < 2) {
      errors.push('technical_error');
      technicalErrors++;
    }

    const uniqueOptions = new Set(item.options);
    if (uniqueOptions.size < item.options.length) {
      errors.push('technical_error');
      technicalErrors++;
    }

    if (typeof item.correctAnswer !== 'number' || item.correctAnswer < 0 || item.correctAnswer >= item.options.length) {
      errors.push('technical_error');
      technicalErrors++;
    }

    const questionText = item.question.replace(/<[^>]+>/g, '').replace(/<ruby>.*?<\/ruby>/g, '');
    if (seenQuestions.has(questionText.trim())) {
      errors.push('technical_error');
      technicalErrors++;
    }
    seenQuestions.add(questionText.trim());

    if (typeof item.difficulty !== 'number' || item.difficulty <= 0) {
      errors.push('technical_error');
      technicalErrors++;
    }

    const questionWords = extractJapaneseWords(item.question);
    const optionWords = new Set();
    item.options.forEach(opt => {
      extractJapaneseWords(opt).forEach(w => optionWords.add(w));
    });

    const allWords = new Set([...questionWords, ...optionWords]);
    const unknownWords = [];
    allWords.forEach(word => {
      if (word.length > 1) {
        const wordClean = word.trim().replace(/[？。、]/g, '');
        if (!wordClean) return;
        
        let found = false;
        if (lessonVocab.has(wordClean) || commonWords.has(wordClean)) {
          found = true;
        }
        
        if (!found) {
          for (const vocabWord of lessonVocab) {
            if (wordClean.includes(vocabWord) || vocabWord.includes(wordClean)) {
              found = true;
              break;
            }
          }
        }
        
        if (!found) {
          for (const commonWord of commonWords) {
            if (wordClean.includes(commonWord) || commonWord.includes(wordClean)) {
              found = true;
              break;
            }
          }
        }
        
        if (!found && wordClean.length > 1 && !/^[0-9]+$/.test(wordClean)) {
          unknownWords.push(wordClean);
        }
      }
    });

    if (unknownWords.length > 0) {
      errors.push('lesson_mismatch');
      lessonMismatches++;
    }

    const correctValue = item.options[item.correctAnswer];
    const cleanQuestion = item.question.replace(/<[^>]+>/g, '').replace(/<ruby>.*?<\/ruby>/g, '');

    if (cleanQuestion.includes(correctValue)) {
      errors.push('answer_error');
      answerErrors++;
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
      let explanation = "";
      if (errors.includes('technical_error')) {
        explanation += "Lỗi kỹ thuật JSON. ";
      }
      if (errors.includes('answer_error')) {
        explanation += "Đáp án xuất hiện trong câu hỏi. ";
      }
      if (errors.includes('lesson_mismatch')) {
        explanation += `Từ vựng vượt bài: ${unknownWords.slice(0, 3).join(', ')}. `;
      }

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

const result = checkQuiz(quizData, lessonVocab);
console.log(JSON.stringify(result, null, 2));
