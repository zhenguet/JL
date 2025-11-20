import { MultipleChoiceExercise } from '@/types/exercise';

// Multiple choice exercises for vocabulary, kanji reading, etc.
export const multipleChoiceExercises: Record<number, MultipleChoiceExercise[]> = {
  1: [ // Lesson 1
    {
      id: 'mc-1-1',
      type: 'multiple-choice',
      difficulty: 'N5',
      category: 'vocabulary',
      question: '"こんにちは" có nghĩa là gì?',
      options: ['Xin chào', 'Tạm biệt', 'Cảm ơn', 'Xin lỗi'],
      correctIndex: 0,
      explanation: '"こんにちは" (konnichiwa) là lời chào phổ biến nhất trong tiếng Nhật, dùng vào ban ngày.'
    },
    {
      id: 'mc-1-2',
      type: 'multiple-choice',
      difficulty: 'N5',
      category: 'kanji-reading',
      question: 'Cách đọc của "学生" là gì?',
      options: ['がくせい', 'せんせい', 'がっこう', 'せいと'],
      correctIndex: 0,
      explanation: '"学生" đọc là "がくせい" (gakusei), nghĩa là học sinh/sinh viên.'
    },
    {
      id: 'mc-1-3',
      type: 'multiple-choice',
      difficulty: 'N5',
      category: 'vocabulary',
      question: 'Từ nào có nghĩa là "sách"?',
      options: ['ほん', 'かばん', 'つくえ', 'いす'],
      correctIndex: 0,
      explanation: '"ほん" (本) nghĩa là sách.'
    }
  ],

  2: [ // Lesson 2
    {
      id: 'mc-2-1',
      type: 'multiple-choice',
      difficulty: 'N5',
      category: 'vocabulary',
      question: '"おはよう" dùng khi nào?',
      options: ['Buổi sáng', 'Buổi trưa', 'Buổi tối', 'Bất kỳ lúc nào'],
      correctIndex: 0,
      explanation: '"おはよう" (ohayou) là lời chào buổi sáng.'
    },
    {
      id: 'mc-2-2',
      type: 'multiple-choice',
      difficulty: 'N5',
      category: 'kanji-reading',
      question: 'Cách đọc của "先生" là gì?',
      options: ['せんせい', 'がくせい', 'せいと', 'きょうし'],
      correctIndex: 0,
      explanation: '"先生" đọc là "せんせい" (sensei), nghĩa là giáo viên.'
    }
  ],

  3: [ // Lesson 3
    {
      id: 'mc-3-1',
      type: 'multiple-choice',
      difficulty: 'N5',
      category: 'grammar',
      question: 'Câu nào đúng?',
      options: [
        '私は学生です。',
        '私が学生です。',
        '私を学生です。',
        '私に学生です。'
      ],
      correctIndex: 0,
      explanation: 'Dùng "は" để đánh dấu chủ đề câu. "私は学生です" = Tôi là học sinh.'
    },
    {
      id: 'mc-3-2',
      type: 'multiple-choice',
      difficulty: 'N5',
      category: 'vocabulary',
      question: 'Từ nào có nghĩa là "ăn"?',
      options: ['たべる', 'のむ', 'みる', 'きく'],
      correctIndex: 0,
      explanation: '"たべる" (食べる) nghĩa là ăn.'
    }
  ]
};

export function getMultipleChoiceExercises(lessonNumber: number): MultipleChoiceExercise[] {
  return multipleChoiceExercises[lessonNumber] || [];
}

export function getRandomMultipleChoiceExercise(lessonNumber: number): MultipleChoiceExercise | null {
  const exercises = getMultipleChoiceExercises(lessonNumber);
  if (exercises.length === 0) return null;
  return exercises[Math.floor(Math.random() * exercises.length)];
}
