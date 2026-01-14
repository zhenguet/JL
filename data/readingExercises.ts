import { ReadingExercise } from '@/types/exercise';

// Reading comprehension exercises
export const readingExercises: Record<number, ReadingExercise[]> = {
  1: [ // Lesson 1 - Simple self-introduction
    {
      id: 'reading-1-1',
      type: 'reading',
      difficulty: 'N5',
      question: 'Đọc đoạn văn và trả lời câu hỏi',
      passage: `はじめまして。私はたなかです。学生です。日本人です。
よろしくお願いします。`,
      questions: [
        {
          question: 'たなかさんは何ですか。',
          options: ['学生', '先生', '会社員', '医者'],
          correctIndex: 0
        },
        {
          question: 'たなかさんはどこの人ですか。',
          options: ['日本人', 'アメリカ人', '中国人', 'ベトナム人'],
          correctIndex: 0
        }
      ]
    },
    {
      id: 'reading-1-2',
      type: 'reading',
      difficulty: 'N5',
      question: 'Đọc đoạn hội thoại và trả lời',
      passage: `佐藤：おはようございます。
山田：おはようございます。
佐藤：山田さん、こちらはマイク・ミラーさんです。
ミラー：初めまして。マイク・ミラーです。アメリカから来ました。どうぞよろしく。
佐藤：佐藤けい子です。どうぞよろしく。`,
      questions: [
        {
          question: 'マイク・ミラーさんはどこから来ましたか。',
          options: ['アメリカ', 'ブラジル', 'タイ', 'ドイツ'],
          correctIndex: 0
        },
        {
          question: '「こちらはマイク・ミラーさんです」と紹介したのはだれですか。',
          options: ['佐藤さん', '山田さん', 'サントスさん', 'ワンさん'],
          correctIndex: 0
        },
        {
          question: 'あいさつとして正しい組み合わせはどれですか。',
          options: [
            '初めまして → どうぞよろしく',
            'おはようございます → こんばんは',
            'さようなら → 初めまして',
            'ありがとう → すみません'
          ],
          correctIndex: 0
        }
      ]
    }
  ],

  2: [ // Lesson 2 - Daily routine
    {
      id: 'reading-2-1',
      type: 'reading',
      difficulty: 'N5',
      question: 'Đọc đoạn văn và trả lời câu hỏi',
      passage: `私は毎朝7時に起きます。朝ごはんを食べます。
それから、学校へ行きます。学校は9時に始まります。`,
      questions: [
        {
          question: '何時に起きますか。',
          options: ['6時', '7時', '8時', '9時'],
          correctIndex: 1
        },
        {
          question: '学校は何時に始まりますか。',
          options: ['7時', '8時', '9時', '10時'],
          correctIndex: 2
        },
        {
          question: '朝、何をしますか。',
          options: ['寝ます', '勉強します', '朝ごはんを食べます', 'テレビを見ます'],
          correctIndex: 2
        }
      ]
    }
  ],

  3: [ // Lesson 3 - Family introduction
    {
      id: 'reading-3-1',
      type: 'reading',
      difficulty: 'N5',
      question: 'Đọc đoạn văn và trả lời câu hỏi',
      passage: `私の家族は4人です。父と母と兄がいます。
父は会社員です。母は先生です。兄は大学生です。
私は高校生です。`,
      questions: [
        {
          question: '家族は何人ですか。',
          options: ['3人', '4人', '5人', '6人'],
          correctIndex: 1
        },
        {
          question: 'お父さんは何ですか。',
          options: ['先生', '会社員', '大学生', '医者'],
          correctIndex: 1
        },
        {
          question: 'お兄さんは何ですか。',
          options: ['高校生', '中学生', '大学生', '会社員'],
          correctIndex: 2
        }
      ]
    }
  ]
};

export function getReadingExercises(lessonNumber: number): ReadingExercise[] {
  return readingExercises[lessonNumber] || [];
}

export function getRandomReadingExercise(lessonNumber: number): ReadingExercise | null {
  const exercises = getReadingExercises(lessonNumber);
  if (exercises.length === 0) return null;
  return exercises[Math.floor(Math.random() * exercises.length)];
}
