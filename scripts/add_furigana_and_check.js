const fs = require('fs');
const path = require('path');

const quizDir = path.join(__dirname, '..', 'data', 'quiz');
const files = fs.readdirSync(quizDir).filter(f => f.endsWith('.json')).sort();

const errors = [];
const warnings = [];
const missingFurigana = [];

// Check if text contains kanji
function hasKanji(text) {
  return /[\u4E00-\u9FAF]/.test(text);
}

// Check if text already has ruby tags
function hasRubyTags(text) {
  return /<ruby>/.test(text);
}

// Extract kanji from text (excluding HTML tags and ruby tags)
function extractKanji(text) {
  // Remove HTML tags and ruby tags
  let cleanText = text.replace(/<[^>]*>/g, '');
  // Extract kanji
  const kanjiMatches = cleanText.match(/[\u4E00-\u9FAF]+/g);
  return kanjiMatches || [];
}

function checkQuestion(question, filePath) {
  const { id, question: qText, options, correctAnswer } = question;
  
  // Basic validation: check if correctAnswer is valid
  if (correctAnswer < 0 || correctAnswer >= options.length) {
    errors.push({
      file: path.basename(filePath),
      id,
      issue: `Invalid correctAnswer index: ${correctAnswer} (options length: ${options.length})`,
      current: `correctAnswer: ${correctAnswer}`,
      shouldBe: `correctAnswer: 0-${options.length - 1}`,
      question: qText.replace(/<[^>]*>/g, '').substring(0, 100),
    });
    return;
  }

  const cleanQuestion = qText.replace(/<[^>]*>/g, '');
  const hasKanjiInQuestion = hasKanji(cleanQuestion);
  const hasRubyInQuestion = hasRubyTags(qText);

  // Check for missing furigana
  if (hasKanjiInQuestion && !hasRubyInQuestion) {
    const kanjiFound = extractKanji(cleanQuestion);
    if (kanjiFound.length > 0) {
      missingFurigana.push({
        file: path.basename(filePath),
        id,
        kanji: kanjiFound.join(', '),
        question: cleanQuestion.substring(0, 150),
        fullQuestion: qText,
      });
    }
  }

  // Previous validation patterns...
  const correctValue = options[correctAnswer];

  // Pattern 1: Age questions
  if (qText.includes('なんさい') || qText.includes('おいくつ') || qText.includes('おいくつですか')) {
    if (qText.includes('（　）') && options.includes('さい') && options.includes('がつ')) {
      if (correctValue === 'がつ') {
        const correctIndex = options.indexOf('さい');
        errors.push({
          file: path.basename(filePath),
          id,
          issue: 'Age question should use "さい" not "がつ"',
          current: `correctAnswer: ${correctAnswer} (${correctValue})`,
          shouldBe: `correctAnswer: ${correctIndex} (さい)`,
          question: cleanQuestion.substring(0, 100),
        });
      }
    }
  }

  // Pattern 2: Negative form
  if (qText.includes('ありません') && qText.includes('（　）')) {
    if (options.includes('から') && options.includes('じゃ')) {
      if (correctValue === 'から') {
        const correctIndex = options.indexOf('じゃ');
        errors.push({
          file: path.basename(filePath),
          id,
          issue: 'Negative form should use "じゃ" not "から"',
          current: `correctAnswer: ${correctAnswer} (${correctValue})`,
          shouldBe: `correctAnswer: ${correctIndex} (じゃ)`,
          question: cleanQuestion.substring(0, 100),
        });
      }
    }
  }

  // Pattern 3: Company employee
  if (qText.includes('しゃいん') || qText.includes('かいしゃいん') || qText.includes('社員') || qText.includes('会社員')) {
    if (options.some(opt => opt.includes('Nhân viên công ty')) && options.some(opt => opt.includes('Giáo viên'))) {
      if (correctValue.includes('Giáo viên')) {
        const correctIndex = options.findIndex(opt => opt.includes('Nhân viên công ty'));
        if (correctIndex !== -1) {
          errors.push({
            file: path.basename(filePath),
            id,
            issue: 'Company employee should be "Nhân viên công ty" not "Giáo viên"',
            current: `correctAnswer: ${correctAnswer} (${correctValue})`,
            shouldBe: `correctAnswer: ${correctIndex} (${options[correctIndex]})`,
            question: cleanQuestion.substring(0, 100),
          });
        }
      }
    }
  }

  // Pattern 4: 日本
  if (qText.includes('日本') && options.includes('にほん') && options.includes('にんほん')) {
    if (correctValue === 'にんほん') {
      const correctIndex = options.indexOf('にほん');
      errors.push({
        file: path.basename(filePath),
        id,
        issue: '日本 should be "にほん" not "にんほん"',
        current: `correctAnswer: ${correctAnswer} (${correctValue})`,
        shouldBe: `correctAnswer: ${correctIndex} (にほん)`,
        question: cleanQuestion.substring(0, 100),
      });
    }
  }

  // Pattern 5: 歳
  if (qText.includes('歳') && options.includes('さい')) {
    if (correctValue !== 'さい' && correctValue !== 'ざい') {
      const correctIndex = options.indexOf('さい');
      if (correctIndex !== -1) {
        errors.push({
          file: path.basename(filePath),
          id,
          issue: '歳 should be "さい"',
          current: `correctAnswer: ${correctAnswer} (${correctValue})`,
          shouldBe: `correctAnswer: ${correctIndex} (さい)`,
          question: cleanQuestion.substring(0, 100),
        });
      }
    }
  }

  // Pattern 6: あの人
  if (qText.includes('あの人') && options.includes('あのひと') && options.includes('あのじん')) {
    if (correctValue === 'あのじん') {
      const correctIndex = options.indexOf('あのひと');
      errors.push({
        file: path.basename(filePath),
        id,
        issue: 'あの人 should be "あのひと" not "あのじん"',
        current: `correctAnswer: ${correctAnswer} (${correctValue})`,
        shouldBe: `correctAnswer: ${correctIndex} (あのひと)`,
        question: cleanQuestion.substring(0, 100),
      });
    }
  }

  // Pattern 7: 鞄
  if (qText.includes('鞄') && options.includes('かばん') && options.includes('かっばん')) {
    if (correctValue === 'かっばん') {
      const correctIndex = options.indexOf('かばん');
      errors.push({
        file: path.basename(filePath),
        id,
        issue: '鞄 should be "かばん" not "かっばん"',
        current: `correctAnswer: ${correctAnswer} (${correctValue})`,
        shouldBe: `correctAnswer: ${correctIndex} (かばん)`,
        question: cleanQuestion.substring(0, 100),
      });
    }
  }

  // Pattern 8: いいえ
  if (qText.includes('いいえ') && options.includes('Không') && options.includes('Có thể')) {
    if (correctValue === 'Có thể') {
      const correctIndex = options.indexOf('Không');
      errors.push({
        file: path.basename(filePath),
        id,
        issue: 'いいえ should be "Không" not "Có thể"',
        current: `correctAnswer: ${correctAnswer} (${correctValue})`,
        shouldBe: `correctAnswer: ${correctIndex} (Không)`,
        question: cleanQuestion.substring(0, 100),
      });
    }
  }

  // Pattern 9: あなたがた
  if (qText.includes('あなたがた') && options.some(opt => opt.includes('Các bạn')) && options.some(opt => opt.includes('Chúng tôi'))) {
    if (correctValue.includes('Chúng tôi')) {
      const correctIndex = options.findIndex(opt => opt.includes('Các bạn'));
      if (correctIndex !== -1) {
        errors.push({
          file: path.basename(filePath),
          id,
          issue: 'あなたがた should be "Các bạn" not "Chúng tôi"',
          current: `correctAnswer: ${correctAnswer} (${correctValue})`,
          shouldBe: `correctAnswer: ${correctIndex} (${options[correctIndex]})`,
          question: cleanQuestion.substring(0, 100),
        });
      }
    }
  }

  // Pattern 10: がくせい
  if (qText.includes('がくせい') || qText.includes('学生')) {
    if (options.some(opt => opt.includes('Học sinh') || opt.includes('Sinh viên')) && options.some(opt => opt.includes('Giáo viên'))) {
      if (correctValue.includes('Giáo viên')) {
        const correctIndex = options.findIndex(opt => opt.includes('Học sinh') || opt.includes('Sinh viên'));
        if (correctIndex !== -1) {
          errors.push({
            file: path.basename(filePath),
            id,
            issue: 'がくせい should be "Học sinh" or "Sinh viên" not "Giáo viên"',
            current: `correctAnswer: ${correctAnswer} (${correctValue})`,
            shouldBe: `correctAnswer: ${correctIndex} (${options[correctIndex]})`,
            question: cleanQuestion.substring(0, 100),
          });
        }
      }
    }
  }

  // Pattern 11: せんせい
  if (qText.includes('せんせい') || qText.includes('先生')) {
    if (options.some(opt => opt.includes('Giáo viên')) && options.some(opt => opt.includes('Học sinh'))) {
      if (correctValue.includes('Học sinh')) {
        const correctIndex = options.findIndex(opt => opt.includes('Giáo viên'));
        if (correctIndex !== -1) {
          errors.push({
            file: path.basename(filePath),
            id,
            issue: 'せんせい should be "Giáo viên" not "Học sinh"',
            current: `correctAnswer: ${correctAnswer} (${correctValue})`,
            shouldBe: `correctAnswer: ${correctIndex} (${options[correctIndex]})`,
            question: cleanQuestion.substring(0, 100),
          });
        }
      }
    }
  }

  // Pattern 12: アメリカじん
  if (qText.includes('アメリカじん') || qText.includes('アメリカ人')) {
    if (options.some(opt => opt.includes('Người Mỹ')) && options.some(opt => opt.includes('Người Nhật'))) {
      if (correctValue.includes('Người Nhật')) {
        const correctIndex = options.findIndex(opt => opt.includes('Người Mỹ'));
        if (correctIndex !== -1) {
          errors.push({
            file: path.basename(filePath),
            id,
            issue: 'アメリカじん should be "Người Mỹ" not "Người Nhật"',
            current: `correctAnswer: ${correctAnswer} (${correctValue})`,
            shouldBe: `correctAnswer: ${correctIndex} (${options[correctIndex]})`,
            question: cleanQuestion.substring(0, 100),
          });
        }
      }
    }
  }

  // Pattern 13: にほんじん
  if (qText.includes('にほんじん') || qText.includes('日本人')) {
    if (options.some(opt => opt.includes('Người Nhật')) && options.some(opt => opt.includes('Người Mỹ'))) {
      if (correctValue.includes('Người Mỹ')) {
        const correctIndex = options.findIndex(opt => opt.includes('Người Nhật'));
        if (correctIndex !== -1) {
          errors.push({
            file: path.basename(filePath),
            id,
            issue: 'にほんじん should be "Người Nhật" not "Người Mỹ"',
            current: `correctAnswer: ${correctAnswer} (${correctValue})`,
            shouldBe: `correctAnswer: ${correctIndex} (${options[correctIndex]})`,
            question: cleanQuestion.substring(0, 100),
          });
        }
      }
    }
  }

  // Pattern 14: ベトナム
  if (qText.includes('ベトナム') || qText.includes('ベトナムじん') || qText.includes('ベトナム人')) {
    if (options.some(opt => opt.includes('Việt Nam') || opt.includes('Người Việt'))) {
      const correctIndex = options.findIndex(opt => opt.includes('Việt Nam') || opt.includes('Người Việt'));
      if (correctIndex !== -1 && correctAnswer !== correctIndex) {
        errors.push({
          file: path.basename(filePath),
          id,
          issue: 'ベトナム should be "Việt Nam" or "Người Việt"',
          current: `correctAnswer: ${correctAnswer} (${correctValue})`,
          shouldBe: `correctAnswer: ${correctIndex} (${options[correctIndex]})`,
          question: cleanQuestion.substring(0, 100),
        });
      }
    }
  }

  // Pattern 15: ちゅうごく
  if (qText.includes('ちゅうごく') || qText.includes('中国') || qText.includes('ちゅうごくじん') || qText.includes('中国人')) {
    if (options.some(opt => opt.includes('Trung Quốc') || opt.includes('Người Trung') || opt.includes('ちゅうごく'))) {
      const correctIndex = options.findIndex(opt => opt.includes('Trung Quốc') || opt.includes('Người Trung') || opt.includes('ちゅうごく'));
      if (correctIndex !== -1 && !correctValue.includes('Trung') && !correctValue.includes('ちゅうごく') && !correctValue.includes('中国')) {
        errors.push({
          file: path.basename(filePath),
          id,
          issue: 'ちゅうごく should be related to "Trung Quốc" or "ちゅうごく"',
          current: `correctAnswer: ${correctAnswer} (${correctValue})`,
          shouldBe: `correctAnswer: ${correctIndex} (${options[correctIndex]})`,
          question: cleanQuestion.substring(0, 100),
        });
      }
    }
  }

  // Pattern 16: かんこく
  if (qText.includes('かんこく') || qText.includes('韓国') || qText.includes('かんこくじん') || qText.includes('韓国人')) {
    if (options.some(opt => opt.includes('Hàn Quốc') || opt.includes('Người Hàn') || opt.includes('かんこく'))) {
      const correctIndex = options.findIndex(opt => opt.includes('Hàn Quốc') || opt.includes('Người Hàn') || opt.includes('かんこく'));
      if (correctIndex !== -1 && !correctValue.includes('Hàn') && !correctValue.includes('かんこく') && !correctValue.includes('韓国')) {
        errors.push({
          file: path.basename(filePath),
          id,
          issue: 'かんこく should be related to "Hàn Quốc" or "かんこく"',
          current: `correctAnswer: ${correctAnswer} (${correctValue})`,
          shouldBe: `correctAnswer: ${correctIndex} (${options[correctIndex]})`,
          question: cleanQuestion.substring(0, 100),
        });
      }
    }
  }

  // Pattern 17: 失礼ですが
  if (qText.includes('失礼ですが') && options.includes('Cảm ơn') && options.some(opt => opt.includes('Xin lỗi') || opt.includes('Excuse'))) {
    if (correctValue === 'Cảm ơn') {
      const correctIndex = options.findIndex(opt => opt.includes('Xin lỗi') || opt.includes('Excuse'));
      if (correctIndex !== -1) {
        errors.push({
          file: path.basename(filePath),
          id,
          issue: '失礼ですが should be "Xin lỗi" not "Cảm ơn"',
          current: `correctAnswer: ${correctAnswer} (${correctValue})`,
          shouldBe: `correctAnswer: ${correctIndex} (${options[correctIndex]})`,
          question: cleanQuestion.substring(0, 100),
        });
      }
    }
  }

  // Check for duplicate options
  const optionCounts = {};
  options.forEach((opt, idx) => {
    const key = opt.trim().toLowerCase();
    if (!optionCounts[key]) optionCounts[key] = [];
    optionCounts[key].push(idx);
  });
  const duplicates = Object.entries(optionCounts).filter(([_, indices]) => indices.length > 1);
  if (duplicates.length > 0) {
    warnings.push({
      file: path.basename(filePath),
      id,
      issue: 'Duplicate options found',
      details: duplicates.map(([opt, indices]) => `"${opt}" at indices: ${indices.join(', ')}`).join('; '),
      question: cleanQuestion.substring(0, 100),
    });
  }
}

console.log('Checking all quiz files...\n');

files.forEach(file => {
  const filePath = path.join(quizDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(content);
    
    if (Array.isArray(questions)) {
      questions.forEach(q => checkQuestion(q, filePath));
    } else {
      console.error(`Warning: ${file} is not an array`);
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
});

// Report results
if (errors.length === 0 && warnings.length === 0 && missingFurigana.length === 0) {
  console.log('✓ No errors, warnings, or missing furigana found!');
} else {
  if (errors.length > 0) {
    console.log(`\n=== ERRORS (${errors.length}) ===\n`);
    errors.forEach((error, index) => {
      console.log(`${index + 1}. [${error.file}] Q${error.id}: ${error.issue}`);
      console.log(`   Current: ${error.current}`);
      console.log(`   Should be: ${error.shouldBe}`);
      console.log(`   Question: ${error.question}`);
      console.log('');
    });
    
    console.log('\nSummary by file (ERRORS):');
    const byFile = {};
    errors.forEach(e => {
      if (!byFile[e.file]) byFile[e.file] = [];
      byFile[e.file].push(e);
    });
    Object.keys(byFile).sort().forEach(file => {
      console.log(`  ${file}: ${byFile[file].length} errors`);
    });
  }

  if (warnings.length > 0) {
    console.log(`\n\n=== WARNINGS (${warnings.length}) ===\n`);
    warnings.forEach((warning, index) => {
      console.log(`${index + 1}. [${warning.file}] Q${warning.id}: ${warning.issue}`);
      console.log(`   ${warning.details}`);
      console.log(`   Question: ${warning.question}`);
      console.log('');
    });
    
    console.log('\nSummary by file (WARNINGS):');
    const byFileWarn = {};
    warnings.forEach(w => {
      if (!byFileWarn[w.file]) byFileWarn[w.file] = [];
      byFileWarn[w.file].push(w);
    });
    Object.keys(byFileWarn).sort().forEach(file => {
      console.log(`  ${file}: ${byFileWarn[file].length} warnings`);
    });
  }

  if (missingFurigana.length > 0) {
    console.log(`\n\n=== MISSING FURIGANA (${missingFurigana.length}) ===\n`);
    console.log('Questions with kanji but no ruby tags:\n');
    
    const byFile = {};
    missingFurigana.forEach(m => {
      if (!byFile[m.file]) byFile[m.file] = [];
      byFile[m.file].push(m);
    });

    Object.keys(byFile).sort().forEach(file => {
      console.log(`\n[${file}] - ${byFile[file].length} questions:`);
      byFile[file].forEach((m, idx) => {
        console.log(`  ${idx + 1}. Q${m.id}: Kanji found: ${m.kanji}`);
        console.log(`     Question: ${m.question}`);
      });
    });

    // Save to file for reference
    const reportPath = path.join(__dirname, '..', 'scripts', 'missing_furigana_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(missingFurigana, null, 2), 'utf8');
    console.log(`\n\nFull report saved to: ${reportPath}`);
  }
}
