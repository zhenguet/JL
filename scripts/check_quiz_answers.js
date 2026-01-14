const fs = require('fs');
const path = require('path');

const quizDir = path.join(__dirname, '..', 'data', 'quiz');
const files = fs.readdirSync(quizDir).filter(f => f.endsWith('.json')).sort();

const errors = [];
const warnings = [];

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

  const correctValue = options[correctAnswer];
  const cleanQuestion = qText.replace(/<[^>]*>/g, '');

  // Pattern 1: Age questions (なんさい, おいくつ) should use "さい" not "がつ"
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

  // Pattern 2: Negative form with ありません should use "じゃ" not "から"
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

  // Pattern 3: しゃいん/かいしゃいん should be "Nhân viên công ty" not "Giáo viên"
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

  // Pattern 4: 日本 should be "にほん" not "にんほん"
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

  // Pattern 5: 歳 should be "さい" not "サー" or other
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

  // Pattern 6: あの人 should be "あのひと" not "あのじん"
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

  // Pattern 7: 鞄 should be "かばん" not "かっばん"
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

  // Pattern 8: いいえ should be "Không" not "Có thể"
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

  // Pattern 9: あなたがた should be "Các bạn" not "Chúng tôi"
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

  // Pattern 10: がくせい should be "Học sinh" or "Sinh viên" not "Giáo viên"
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

  // Pattern 11: せんせい should be "Giáo viên" not "Học sinh"
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

  // Pattern 12: アメリカじん should be "Người Mỹ" not "Người Nhật"
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

  // Pattern 13: にほんじん should be "Người Nhật" not "Người Mỹ"
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

  // Pattern 14: ベトナム should be "Việt Nam" not other countries
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

  // Pattern 15: ちゅうごく should be "Trung Quốc" or "Người Trung" not other
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

  // Pattern 16: かんこく should be "Hàn Quốc" or "Người Hàn" not other
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

  // Pattern 17: こちらは should be "Đây là" or similar, not "Tên là"
  if (qText.includes('こちらは') && options.some(opt => opt.includes('こちらは'))) {
    const correctIndex = options.findIndex(opt => opt.includes('こちらは'));
    if (correctIndex !== -1 && correctAnswer !== correctIndex) {
      errors.push({
        file: path.basename(filePath),
        id,
        issue: 'こちらは should match the option containing "こちらは"',
        current: `correctAnswer: ${correctAnswer} (${correctValue})`,
        shouldBe: `correctAnswer: ${correctIndex} (${options[correctIndex]})`,
        question: cleanQuestion.substring(0, 100),
      });
    }
  }

  // Pattern 18: 失礼ですが should be "Xin lỗi" or "Excuse me" not "Cảm ơn"
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

  // Pattern 19: 初めまして should be "Rất vui được gặp" or similar greeting
  if (qText.includes('初めまして') && options.some(opt => opt.includes('初めまして'))) {
    const correctIndex = options.findIndex(opt => opt.includes('初めまして'));
    if (correctIndex !== -1 && correctAnswer !== correctIndex) {
      errors.push({
        file: path.basename(filePath),
        id,
        issue: '初めまして should match the option containing "初めまして"',
        current: `correctAnswer: ${correctAnswer} (${correctValue})`,
        shouldBe: `correctAnswer: ${correctIndex} (${options[correctIndex]})`,
        question: cleanQuestion.substring(0, 100),
      });
    }
  }

  // Pattern 20: どうぞよろしく should be greeting response
  if (qText.includes('どうぞよろしく') && options.some(opt => opt.includes('どうぞよろしく'))) {
    const correctIndex = options.findIndex(opt => opt.includes('どうぞよろしく'));
    if (correctIndex !== -1 && correctAnswer !== correctIndex) {
      errors.push({
        file: path.basename(filePath),
        id,
        issue: 'どうぞよろしく should match the option containing "どうぞよろしく"',
        current: `correctAnswer: ${correctAnswer} (${correctValue})`,
        shouldBe: `correctAnswer: ${correctIndex} (${options[correctIndex]})`,
        question: cleanQuestion.substring(0, 100),
      });
    }
  }

  // Pattern 21: Check for duplicate options
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

  // Pattern 22: Check if question text contains answer (self-answering)
  const questionLower = cleanQuestion.toLowerCase();
  options.forEach((opt, idx) => {
    const optLower = opt.trim().toLowerCase();
    if (optLower.length > 3 && questionLower.includes(optLower) && idx === correctAnswer) {
      warnings.push({
        file: path.basename(filePath),
        id,
        issue: 'Question may contain the answer',
        details: `Option "${opt}" appears in question text`,
        question: cleanQuestion.substring(0, 100),
      });
    }
  });
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

if (errors.length === 0 && warnings.length === 0) {
  console.log('✓ No errors or warnings found!');
} else {
  if (errors.length > 0) {
    console.log(`\nFound ${errors.length} ERRORS:\n`);
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
    console.log(`\n\nFound ${warnings.length} WARNINGS:\n`);
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
}
