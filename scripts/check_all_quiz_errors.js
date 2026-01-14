const fs = require('fs');
const path = require('path');

const QUIZ_DIR = path.join(__dirname, '..', 'data', 'quiz');
const files = fs.readdirSync(QUIZ_DIR).filter(f => f.endsWith('.json') && f.startsWith('quiz')).sort();

const errors = [];

function checkQuestion(question, filePath) {
  const { id, question: qText, options, correctAnswer } = question;
  
  if (!options || options.length === 0) return;
  if (correctAnswer < 0 || correctAnswer >= options.length) {
    errors.push({
      file: path.basename(filePath),
      id,
      issue: `Invalid correctAnswer index: ${correctAnswer}`,
      type: 'invalid_index'
    });
    return;
  }

  const correctValue = options[correctAnswer];
  const cleanQuestion = qText.replace(/<[^>]*>/g, '').replace(/<ruby>.*?<\/ruby>/g, '');

  const patterns = [
    {
      name: 'kaiwa_conversation',
      check: (q, opts, correct) => {
        if (q.includes('かいわ') || q.includes('会話')) {
          const correctIdx = opts.findIndex(opt => 
            opt.includes('Hội thoại') || opt.includes('会話') || opt === 'かいわ'
          );
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'elevator',
      check: (q, opts, correct) => {
        if (q.includes('cầu thang máy') || q.includes('thang máy')) {
          const correctIdx = opts.findIndex(opt => opt.includes('エレベーター'));
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        if (q.includes('エレベーター')) {
          const correctIdx = opts.findIndex(opt => opt.includes('Thang máy') || opt.includes('thang máy'));
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'lobby',
      check: (q, opts, correct) => {
        if (q.includes('Hành lang') || q.includes('đại sảnh') || q.includes('tiền sảnh')) {
          const correctIdx = opts.findIndex(opt => opt === 'ロビー' || opt.includes('ロビー'));
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'shokudou',
      check: (q, opts, correct) => {
        if (q.includes('食堂')) {
          const correctIdx = opts.findIndex(opt => opt === 'しょくどう');
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'yen',
      check: (q, opts, correct) => {
        if (q.includes('～円') || q.includes('～えん')) {
          const correctIdx = opts.findIndex(opt => opt === '～えん' || opt.includes('～えん'));
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'niwa',
      check: (q, opts, correct) => {
        if (q.includes('にわ')) {
          const correctIdx = opts.findIndex(opt => (opt.includes('Sân') || opt.includes('Vườn')) && !opt.includes('Sântrường'));
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'uchi',
      check: (q, opts, correct) => {
        if (q.includes('うち') && !q.includes('うちます') && !q.includes('うちゅう')) {
          const correctIdx = opts.findIndex(opt => opt.includes('Nhà') && !opt.includes('Cửa'));
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'uketsuke',
      check: (q, opts, correct) => {
        if (q.includes('うけつけ')) {
          const correctIdx = opts.findIndex(opt => opt === '受付');
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'dochira',
      check: (q, opts, correct) => {
        if (q.includes('どちら') && !q.includes('（　）')) {
          const correctIdx = opts.findIndex(opt => 
            opt.includes('ở đâu') || opt.includes('cái nào') || opt.includes('どちら')
          );
          if (correctIdx !== -1 && correct !== correctIdx && !opts[correct].includes('ở đâu')) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'sokora',
      check: (q, opts, correct) => {
        if (q.includes('そちら') && !q.includes('（　）')) {
          const correctIdx = opts.findIndex(opt => opt.includes('Chỗ đó') || opt.includes('chỗ đó'));
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'sen',
      check: (q, opts, correct) => {
        if (q.includes('千')) {
          const correctIdx = opts.findIndex(opt => opt === 'せん');
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'kyoushitsu',
      check: (q, opts, correct) => {
        if (q.includes('きょうしつ')) {
          const correctIdx = opts.findIndex(opt => opt.includes('lớp học') || opt.includes('phòng học'));
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'soko',
      check: (q, opts, correct) => {
        if (q.includes('そこ') && !q.includes('（　）') && !q.includes('あそこ')) {
          const correctIdx = opts.findIndex(opt => opt.includes('Chỗ đó') || opt.includes('chỗ đó'));
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'nankai',
      check: (q, opts, correct) => {
        if (q.includes('なんかい')) {
          const correctIdx = opts.findIndex(opt => opt.includes('Tầng mấy'));
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'heya',
      check: (q, opts, correct) => {
        if (q.includes('phòng') && !q.includes('họp') && !q.includes('ăn') && !q.includes('vệ sinh')) {
          const correctIdx = opts.findIndex(opt => opt === 'へや' || opt.includes('へや'));
          if (correctIdx !== -1 && correct !== correctIdx && !opts[correct].includes('へや')) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'ikura',
      check: (q, opts, correct) => {
        if (q.includes('いくら') && !q.includes('（　）')) {
          const correctIdx = opts.findIndex(opt => opt.includes('Bao nhiêu tiền') || opt.includes('bao nhiêu tiền'));
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'wine',
      check: (q, opts, correct) => {
        if (q.includes('rượu vang') && !q.includes('quầy')) {
          const correctIdx = opts.findIndex(opt => opt === 'ワイン');
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'wine_counter',
      check: (q, opts, correct) => {
        if (q.includes('ワインうりば')) {
          const correctIdx = opts.findIndex(opt => opt.includes('quầy bán rượu vang'));
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'kutsu',
      check: (q, opts, correct) => {
        if (q.includes('くつ')) {
          const correctIdx = opts.findIndex(opt => opt === '靴' || opt.includes('giầy'));
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'kaisha',
      check: (q, opts, correct) => {
        if (q.includes('かいしゃ') && !q.includes('（　）')) {
          const correctIdx = opts.findIndex(opt => opt.includes('Công ty') || opt.includes('công ty'));
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'chika_ikkai',
      check: (q, opts, correct) => {
        if (q.includes('ちかいっかい')) {
          const correctIdx = opts.findIndex(opt => opt.includes('tầng ngầm') || opt.includes('Tầng ngầm'));
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'koko',
      check: (q, opts, correct) => {
        if (q.includes('ここ') && !q.includes('（　）')) {
          const correctIdx = opts.findIndex(opt => opt.includes('Chỗ này') || opt.includes('chỗ này'));
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    },
    {
      name: 'kenshusei',
      check: (q, opts, correct) => {
        if (q.includes('研修生') || q.includes('けんしゅうせい')) {
          const correctIdx = opts.findIndex(opt => opt === 'けんしゅうせい');
          if (correctIdx !== -1 && correct !== correctIdx) {
            return { shouldBe: correctIdx, current: correct };
          }
        }
        return null;
      }
    }
  ];

  for (const pattern of patterns) {
    const result = pattern.check(cleanQuestion, options, correctAnswer);
    if (result) {
      errors.push({
        file: path.basename(filePath),
        id,
        type: pattern.name,
        issue: `Wrong answer for ${pattern.name}`,
        current: `correctAnswer: ${result.current} (${options[result.current]})`,
        shouldBe: `correctAnswer: ${result.shouldBe} (${options[result.shouldBe]})`,
        question: cleanQuestion.substring(0, 100)
      });
      break;
    }
  }
}

console.log('Checking all quiz files for common errors...\n');

files.forEach(file => {
  const filePath = path.join(QUIZ_DIR, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(content);
    
    if (Array.isArray(questions)) {
      questions.forEach(q => checkQuestion(q, filePath));
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
});

if (errors.length === 0) {
  console.log('✓ No errors found!');
} else {
  console.log(`\nFound ${errors.length} ERRORS:\n`);
  
  const byFile = {};
  errors.forEach(e => {
    if (!byFile[e.file]) byFile[e.file] = [];
    byFile[e.file].push(e);
  });

  Object.keys(byFile).sort().forEach(file => {
    console.log(`\n${file}: ${byFile[file].length} errors`);
    byFile[file].forEach((error, idx) => {
      console.log(`  ${idx + 1}. Q${error.id} (${error.type}): ${error.issue}`);
      console.log(`     Current: ${error.current}`);
      console.log(`     Should be: ${error.shouldBe}`);
    });
  });

  const outputFile = path.join(__dirname, 'quiz_errors_report.json');
  fs.writeFileSync(outputFile, JSON.stringify(errors, null, 2), 'utf-8');
  console.log(`\n\nDetailed report saved to: ${outputFile}`);
}
