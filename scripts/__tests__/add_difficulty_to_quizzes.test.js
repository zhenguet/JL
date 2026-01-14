const assert = require('assert');
const { describe, test } = require('node:test');
const os = require('os');
const path = require('path');
const fs = require('fs');
const {
  determineDifficulty,
  extractTextFromHtml,
  addDifficultyToQuizFile,
} = require('../add_difficulty_to_quizzes');

function buildQuestion(question, options = ['A', 'B', 'C', 'D']) {
  return {
    question,
    options,
    correctAnswer: 0,
  };
}

describe('determineDifficulty', () => {
  test('returns level 1 for simple hiragana only', () => {
    const q = buildQuestion('これは なん です か？');
    const level = determineDifficulty(q);
    assert.strictEqual(level, 1);
  });

  test('returns level 2 when few kanji with furigana', () => {
    const q = buildQuestion('<ruby>学校<rt>がっこう</rt></ruby>へ いきます。');
    const level = determineDifficulty(q);
    assert.strictEqual(level, 2);
  });

  test('returns level 5 for many kanji with complex grammar', () => {
    const q = buildQuestion('彼は（　）仕事を終わらせたら、すぐに帰られる予定です。漢字が十二以上含まれている長い文章です。');
    const level = determineDifficulty(q);
    assert.strictEqual(level, 5);
  });

  test('caps at 5 for very long question with many kanji', () => {
    const longQuestion =
      'これは非常に長い日本語の文で、複雑な文法と多くの漢字を含み、させられる形や条件文も混在しているため、読解がかなり難しい内容になっています。さらに、選択肢も長くて読みづらいものが並んでいます。';
    const q = buildQuestion(longQuestion, [
      '非常に長い選択肢一',
      'さらに長い選択肢二で漢字を多く含む文章です',
      'これはもっと長い選択肢三で読みにくいです',
      '難しい長い選択肢四',
    ]);
    const level = determineDifficulty(q);
    assert.strictEqual(level, 5);
  });
});

describe('extractTextFromHtml', () => {
  test('removes HTML tags', () => {
    const html = '<p>これは<strong>テスト</strong>です</p>';
    const result = extractTextFromHtml(html);
    assert.strictEqual(result, 'これはテストです');
  });

  test('handles empty string', () => {
    const result = extractTextFromHtml('');
    assert.strictEqual(result, '');
  });

  test('handles text without HTML', () => {
    const result = extractTextFromHtml('これはテストです');
    assert.strictEqual(result, 'これはテストです');
  });
});

describe('addDifficultyToQuizFile', () => {
  test('adds difficulty and returns stats', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-diff-'));
    const filePath = path.join(tmpDir, 'quiz.json');
    const original = [
      {
        id: 1,
        question: 'これは なん です か？',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
      },
      {
        id: 2,
        question: '<ruby>学校<rt>がっこう</rt></ruby>へ いきます。',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 1,
      },
    ];
    fs.writeFileSync(filePath, JSON.stringify(original, null, 2), 'utf-8');

    const { updated, difficultyStats } = addDifficultyToQuizFile(filePath);
    const updatedData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    assert.strictEqual(updated, true);
    assert.ok(difficultyStats[1] + difficultyStats[2] + difficultyStats[3] + difficultyStats[4] + difficultyStats[5] > 0);
    updatedData.forEach((q) => {
      assert.ok(q.difficulty >= 1 && q.difficulty <= 5);
    });
  });
});
