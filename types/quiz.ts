export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty?: number;
}

export interface ShuffledQuestion extends QuizQuestion {
  shuffledOptions: string[];
  shuffledCorrectAnswer: number;
}
