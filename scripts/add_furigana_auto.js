const fs = require('fs');
const path = require('path');

// Basic kanji dictionary - common readings
const kanjiDict = {
  '人': 'ひと',
  '社員': 'しゃいん',
  '失礼': 'しつれい',
  '方': 'かた',
  '大学': 'だいがく',
  '何歳': 'なんさい',
  '歳': 'さい',
  '病院': 'びょういん',
  '願': 'ねがい',
  '日本': 'にほん',
  '電気': 'でんき',
  '研究者': 'けんきゅうしゃ',
  '研修生': 'けんしゅうせい',
  '会社員': 'かいしゃいん',
  '銀行員': 'ぎんこういん',
  '医者': 'いしゃ',
  '先生': 'せんせい',
  '専門': 'せんもん',
  '学生': 'がくせい',
  '技術者': 'ぎじゅつしゃ',
  '教師': 'きょうし',
  '初': 'はじ',
  '私': 'わたし',
  '来': 'き',
  '左': 'ひだり',
  '電池': 'でんち',
  '乗': 'の',
  '場': 'ば',
  '県': 'けん',
  '公園': 'こうえん',
  '男': 'おとこ',
  '子': 'こ',
  '犬': 'いぬ',
  '前': 'まえ',
  '猫': 'ねこ',
  '近': 'ちか',
  '女': 'おんな',
  '上': 'うえ',
  '外': 'そと',
  '木': 'き',
  '天気': 'てんき',
  '両親': 'りょうしん',
  '休': 'やす',
  '船便': 'ふなびん',
  '五': 'ご',
  '切符': 'きっぷ',
  '二': 'に',
  '回': 'かい',
  '留学生': 'りゅうがくせい',
  '子供': 'こども',
  '外国': 'がいこく',
  '六': 'ろく',
  '一': 'いち',
  '兄弟': 'きょうだい',
  '週間': 'しゅうかん',
  '切手': 'きって',
  '書留': 'かきとめ',
  '空港': 'くうこう',
  '刺身': 'さしみ',
  '焼': 'や',
  '雪': 'ゆき',
  '世界': 'せかい',
  '多': 'おお',
  '夏': 'なつ',
  '旅行': 'りょこう',
  '町': 'まち',
  '見物': 'けんぶつ',
  '釣': 'つ',
  '美術': 'びじゅつ',
  '遊': 'あそ',
  '服': 'ふく',
  '経済': 'けいざい',
  '買': 'か',
  '物': 'もの',
  '製品': 'せいひん',
  '登録': 'とうろく',
  '会議': 'かいぎ',
  '独身': 'どくしん',
  '市役所': 'しやくしょ',
  '迎': 'むか',
  '公園': 'こうえん',
  '散歩': 'さんぽ',
  '見学': 'けんがく',
  '疲': 'つか',
  '家族': 'かぞく',
  '出': 'だ',
  '覚': 'おぼ',
  '雨': 'あめ',
  '降': 'ふ',
  '地図': 'ちず',
  '始': 'はじ',
  '住所': 'じゅうしょ',
  '話': 'はなし',
  '言葉': 'ことば',
  '信号': 'しんごう',
  '右': 'みぎ',
  '曲': 'まが',
  '開': 'あ',
  '教': 'おし',
  '呼': 'よ',
  '塩': 'しお',
  '言': 'い',
  '待': 'ま',
  '閉': 'し',
  '止': 'と',
  '知': 'し',
  '住': 'す',
  '椅子': 'いす',
  '座': 'すわ',
  '作': 'つく',
  '造': 'ぞう',
  '置': 'お',
  '使': 'つか',
  '妹': 'いもうと',
  '歯医者': 'はいしゃ',
  '思': 'おも',
  '出': 'だ',
  '売': 'う',
  '研究': 'けんきゅう',
  '東京': 'とうきょう',
  '確認': 'かくにん',
  '歩': 'ある',
  '浴': 'あび',
  '髪': 'かみ',
  '体': 'からだ',
  '番': 'ばん',
  '金額': 'きんがく',
  '神社': 'じんじゃ',
  '歯': 'は',
  '食事': 'しょくじ',
  '何': 'なに',
  '口': 'くち',
  '足': 'あし',
  '押': 'お',
  '長': 'なが',
  '洗': 'あら',
  '辞': 'や',
  '電車': 'でんしゃ',
  '降': 'お',
  '風呂': 'ふろ',
  '入': 'はい',
  '払': 'はら',
  '熱': 'ねつ',
  '忘': 'わす',
  '上着': 'うわぎ',
  '返': 'かえ',
  '答': 'こた',
  '問題': 'もんだい',
  '無': 'な',
  '下着': 'したぎ',
  '痛': 'いた',
  '禁煙': 'きんえん',
  '病気': 'びょうき',
  '換': 'か',
  '社長': 'しゃちょう',
  '大丈夫': 'だいじょうぶ',
  '馬': 'うま',
  '課長': 'かちょう',
  '泳': 'およ',
  '練習': 'れんしゅう',
  '部長': 'ぶちょう',
  '牧場': 'ぼくじょう',
  '日記': 'にっき',
  '国際': 'こくさい',
  '故障': 'こしょう',
  '趣味': 'しゅみ',
  '登': 'のぼ',
  '掃除': 'そうじ',
  '洗濯': 'せんたく',
  '山': 'やま',
  '茶': 'ちゃ',
  '一度': 'いちど',
  '調子': 'ちょうし',
  '鞄': 'かばん',
  '鉛筆': 'えんぴつ',
  '手帳': 'てちょう',
  '新聞': 'しんぶん',
  '本': 'ほん',
  '辞書': 'じしょ',
  '鍵': 'かぎ',
  '時計': 'とけい',
  '電話': 'でんわ',
  '着物': 'きもの',
  '修理': 'しゅうり',
  '僕': 'ぼく',
  '場所': 'ばしょ',
  '皆': 'みな',
  '終': 'おわ',
  '君': 'きみ',
  '直': 'なお',
  '間': 'あいだ',
  '調': 'しら',
  '要': 'い',
  '研修旅行': 'けんしゅうりょこう',
  '政治': 'せいじ',
  '負': 'ま',
  '技術': 'ぎじゅつ',
  '進': 'すす',
  '役': 'やく',
  '立': 'た',
  '大統領': 'だいとうりょう',
  '足': 'た',
  '質問': 'しつもん',
  '寺': 'てら',
  '勝': 'か',
  '不便': 'ふべん',
  '飲': 'の',
  '生': 'う',
  '和室': 'わしつ',
  '靴': 'くつ',
  '白書': 'はくしょ',
  '眼鏡': 'めがね',
  '着': 'き',
  '履': 'は',
  '帽子': 'ぼうし',
  '今度': 'こんど',
  '持': 'も',
  '行': 'い',
  '家賃': 'やちん',
  '約束': 'やくそく',
  '押': 'お',
  '来': 'き',
  '角': 'かど',
  '引': 'ひ',
  '機械': 'きかい',
  '動': 'うご',
  '聞': 'き',
  '道': 'みち',
  '渡': 'わた',
  '回': 'まわ',
  '駐車場': 'ちゅうしゃじょう',
  '交差点': 'こうさてん',
  '目': 'め',
  '建物': 'たてもの',
  '細': 'ほそ',
  '金': 'かね',
  '頑張': 'がんば',
  '意味': 'いみ',
  '調節': 'ちょうせつ',
  '弁当': 'べんとう',
  '送': 'おく',
  '人形': 'にんぎょう',
  '東京': 'とうきょう',
  '連': 'つ',
  '準備': 'じゅんび',
  '説明': 'せつめい',
  '案内': 'あんない',
  '本当': 'ほんとう',
  '大阪城': 'おおさかじょう',
  '名詞': 'めいし',
  '会': 'あ',
  '駅': 'えき',
  '困': 'こま',
  '年': 'とし',
  '取': 'と',
  '考': 'かんが',
  '転勤': 'てんきん',
  '元気': 'げんき',
  '片付': 'かたづ',
  '大使館': 'たいしかん',
  '間違': 'まちが',
  '続': 'つづ',
  '世話': 'せわ',
  '参加': 'さんか',
  '探': 'さが',
  '横': 'よこ',
  '会社': 'かいしゃ',
  '缶': 'かん',
  '瓶': 'びん',
  '怖': 'こわ',
  '月': 'つき',
  '水': 'みず',
  '金': 'きん',
  '新聞社': 'しんぶんしゃ',
  '川': 'かわ',
  '昼間': 'ひるま',
  '日曜大工': 'にちようだいく',
  '聞': 'きこ',
  '将来': 'しょうらい',
  '本棚': 'ほんだな',
  '波': 'なみ',
  '自動販売機': 'じどうはんばいき',
  '付': 'つ',
  '景色': 'けしき',
  '昔': 'むかし',
  '不思議': 'ふしぎ',
  '夢': 'ゆめ',
  '見': 'み',
  '海': 'うみ',
  '空': 'そら',
  '自分': 'じぶん',
  '関西空港': 'かんさいくうこう',
  '日': 'ひ',
  '給料': 'きゅうりょう',
  '息子': 'むすこ',
  '無料': 'むりょう',
  '力': 'ちから',
  '歌手': 'かしゅ',
  // Add more as needed
};

// Function to add ruby tags to kanji
function addRubyTags(text, kanji, reading) {
  // Check if kanji is already in a ruby tag
  if (text.includes(`<ruby>${kanji}`)) {
    return text;
  }
  
  // Escape special regex characters
  const escapedKanji = kanji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Split text by HTML tags to process only text content
  const parts = [];
  let lastIndex = 0;
  const tagRegex = /<[^>]+>/g;
  let match;
  
  while ((match = tagRegex.exec(text)) !== null) {
    // Add text before tag
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    // Add tag
    parts.push({ type: 'tag', content: match[0] });
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) });
  }
  
  // Process only text parts
  const processedParts = parts.map(part => {
    if (part.type === 'text') {
      // Replace kanji in text parts
      const regex = new RegExp(escapedKanji, 'g');
      return part.content.replace(regex, `<ruby>${kanji}<rp>（</rp><rt>${reading}</rt><rp>）</rp></ruby>`);
    }
    return part.content;
  });
  
  return processedParts.join('');
}

// Function to process a question text
function processQuestionText(text) {
  let result = text;
  
  // Sort kanji by length (longer first) to avoid partial matches
  const sortedEntries = Object.entries(kanjiDict).sort((a, b) => b[0].length - a[0].length);
  
  for (const [kanji, reading] of sortedEntries) {
    // Only process if kanji exists and not already in ruby tag
    if (result.includes(kanji) && !result.includes(`<ruby>${kanji}`)) {
      result = addRubyTags(result, kanji, reading);
    }
  }
  
  return result;
}

// Process all quiz files
const quizDir = path.join(__dirname, '..', 'data', 'quiz');
const files = fs.readdirSync(quizDir).filter(f => f.endsWith('.json')).sort();

console.log('Adding furigana to quiz files...\n');

let totalProcessed = 0;
let totalUpdated = 0;

files.forEach(file => {
  const filePath = path.join(quizDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const questions = JSON.parse(content);
    
    if (Array.isArray(questions)) {
      let fileUpdated = 0;
      
      questions.forEach(q => {
        const originalQuestion = q.question;
        const processedQuestion = processQuestionText(originalQuestion);
        
        if (originalQuestion !== processedQuestion) {
          q.question = processedQuestion;
          fileUpdated++;
          totalUpdated++;
        }
        totalProcessed++;
      });
      
      if (fileUpdated > 0) {
        // Write back to file
        fs.writeFileSync(filePath, JSON.stringify(questions, null, 2) + '\n', 'utf8');
        console.log(`✓ ${file}: Updated ${fileUpdated} questions`);
      } else {
        console.log(`  ${file}: No updates needed`);
      }
    }
  } catch (err) {
    console.error(`✗ Error processing ${file}:`, err.message);
  }
});

console.log(`\n=== Summary ===`);
console.log(`Total questions processed: ${totalProcessed}`);
console.log(`Total questions updated: ${totalUpdated}`);
