import { GrammarExercise } from '@/types/exercise';

// Grammar exercises organized by JLPT level and grammar point
export const grammarExercises: Record<number, GrammarExercise[]> = {
  1: [ // Lesson 1 - N5 Basic Particles
    {
      id: 'grammar-1-1',
      type: 'grammar',
      difficulty: 'N5',
      question: 'Chọn trợ từ phù hợp',
      sentence: '私___学生です。',
      options: ['は', 'が', 'を', 'に'],
      correctIndex: 0,
      grammarPoint: 'は particle (topic marker)',
      explanation: '"は" được dùng để đánh dấu chủ đề của câu. "私は" nghĩa là "Tôi (là chủ đề)"'
    },
    {
      id: 'grammar-1-2',
      type: 'grammar',
      difficulty: 'N5',
      question: 'Chọn trợ từ phù hợp',
      sentence: '学校___行きます。',
      options: ['は', 'が', 'を', 'に'],
      correctIndex: 3,
      grammarPoint: 'に particle (direction)',
      explanation: '"に" chỉ hướng đi. "学校に行く" = đi đến trường'
    },
    {
      id: 'grammar-1-3',
      type: 'grammar',
      difficulty: 'N5',
      question: 'Chọn động từ đúng',
      sentence: '毎日日本語___勉強します。',
      options: ['は', 'が', 'を', 'に'],
      correctIndex: 2,
      grammarPoint: 'を particle (object marker)',
      explanation: '"を" đánh dấu tân ngữ trực tiếp. "日本語を勉強する" = học tiếng Nhật'
    },
    {
      id: 'grammar-1-4',
      type: 'grammar',
      difficulty: 'N5',
      question: 'Chọn cách phủ định đúng',
      sentence: 'サントスさんは学生___。',
      options: ['じゃありません', 'です', 'でした', 'ではありませんでした'],
      correctIndex: 0,
      grammarPoint: 'じゃありません (phủ định hiện tại)',
      explanation: 'Mẫu phủ định hiện tại trong bài 1: N は N じゃありません。'
    },
    {
      id: 'grammar-1-5',
      type: 'grammar',
      difficulty: 'N5',
      question: 'Chọn trợ từ phù hợp',
      sentence: 'サントスさん___会社員です。',
      options: ['も', 'は', 'が', 'で'],
      correctIndex: 0,
      grammarPoint: 'も particle (cũng)',
      explanation: 'Mẫu N1 も N2 です: "サントスさんも会社員です".'
    },
    {
      id: 'grammar-1-6',
      type: 'grammar',
      difficulty: 'N5',
      question: 'Điền trợ từ đúng',
      sentence: 'あの方___どなたですか。',
      options: ['は', 'が', 'を', 'に'],
      correctIndex: 0,
      grammarPoint: 'は particle (chủ đề)',
      explanation: 'Hỏi về người: "あの方はどなたですか" dùng は giới thiệu chủ đề.'
    }
  ],
  
  2: [ // Lesson 2 - N5 Time expressions
    {
      id: 'grammar-2-1',
      type: 'grammar',
      difficulty: 'N5',
      question: 'Chọn từ phù hợp',
      sentence: '___7時に起きます。',
      options: ['毎朝', '毎晩', '毎週', '毎月'],
      correctIndex: 0,
      grammarPoint: 'Time expressions',
      explanation: '"毎朝" = mỗi sáng. Câu hoàn chỉnh: "Mỗi sáng tôi dậy lúc 7 giờ"'
    },
    {
      id: 'grammar-2-2',
      type: 'grammar',
      difficulty: 'N5',
      question: 'Chọn trợ từ phù hợp',
      sentence: '日曜日___何をしますか。',
      options: ['は', 'が', 'を', 'に'],
      correctIndex: 3,
      grammarPoint: 'に particle (time)',
      explanation: '"に" dùng với thời gian cụ thể. "日曜日に" = vào Chủ nhật'
    }
  ],

  3: [ // Lesson 3 - N5 Existence verbs
    {
      id: 'grammar-3-1',
      type: 'grammar',
      difficulty: 'N5',
      question: 'Chọn động từ phù hợp',
      sentence: '机の上に本___。',
      options: ['います', 'あります', 'します', 'きます'],
      correctIndex: 1,
      grammarPoint: 'あります (existence for inanimate)',
      explanation: '"あります" dùng cho đồ vật vô tri. "本があります" = có sách'
    },
    {
      id: 'grammar-3-2',
      type: 'grammar',
      difficulty: 'N5',
      question: 'Chọn động từ phù hợp',
      sentence: '公園に子供___。',
      options: ['います', 'あります', 'します', 'きます'],
      correctIndex: 0,
      grammarPoint: 'います (existence for animate)',
      explanation: '"います" dùng cho người và động vật. "子供がいます" = có trẻ em'
    }
  ]
};

// Helper function to get grammar exercises for a lesson
export function getGrammarExercises(lessonNumber: number): GrammarExercise[] {
  return grammarExercises[lessonNumber] || [];
}

// Helper function to get a random grammar exercise
export function getRandomGrammarExercise(lessonNumber: number): GrammarExercise | null {
  const exercises = getGrammarExercises(lessonNumber);
  if (exercises.length === 0) return null;
  return exercises[Math.floor(Math.random() * exercises.length)];
}
