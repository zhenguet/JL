// Exercise Type Definitions for JLPT-Style System

export type ExerciseType =
  | 'fill'
  | 'fill-kanji-hiragana'
  | 'fill-hiragana-from-kanji'
  | 'translate'
  | 'kanji'
  | 'multiple-choice'
  | 'grammar'
  | 'reading'
  | 'listening'
  | 'vocabulary';

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  question: string;
  difficulty?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
}

// Existing exercise types (fill, translate, kanji)
export interface FillExercise extends BaseExercise {
  type: 'fill';
  answer: string;
  hint?: string;
  kanji?: string;
}

export interface FillKanjiHiraganaExercise extends BaseExercise {
  type: 'fill-kanji-hiragana';
  kanji: string;
  hiragana: string;
}

export interface FillHiraganaFromKanjiExercise extends BaseExercise {
  type: 'fill-hiragana-from-kanji';
  kanji: string;
  meaningVi: string;
  answer: string;
}

export interface TranslateExercise extends BaseExercise {
  type: 'translate';
  answer: string;
  kanji?: string;
}

export interface KanjiExercise extends BaseExercise {
  type: 'kanji';
  answer: string;
  hiragana?: string;
}

// New JLPT exercise types
export interface MultipleChoiceExercise extends BaseExercise {
  type: 'multiple-choice';
  options: string[];
  correctIndex: number;
  explanation?: string;
  category?: 'vocabulary' | 'grammar' | 'kanji-reading' | 'general';
}

export interface GrammarExercise extends BaseExercise {
  type: 'grammar';
  sentence: string; // Câu có chỗ trống: "彼は___行きました"
  options: string[];
  correctIndex: number;
  grammarPoint: string; // "へ particle", "た form", etc.
  explanation?: string;
}

export interface ReadingQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ReadingExercise extends BaseExercise {
  type: 'reading';
  passage: string;
  questions: ReadingQuestion[];
}

export interface ListeningExercise extends BaseExercise {
  type: 'listening';
  audioUrl: string;
  options: string[];
  correctIndex: number;
  transcript?: string; // For debugging/admin
}

export interface VocabularyExercise extends BaseExercise {
  type: 'vocabulary';
  word: string;
  wordReading?: string;
  questionType: 'synonym' | 'antonym' | 'usage' | 'meaning';
  options: string[];
  correctIndex: number;
  explanation?: string;
}

// Union type for all exercises
export type Exercise =
  | FillExercise
  | FillKanjiHiraganaExercise
  | FillHiraganaFromKanjiExercise
  | TranslateExercise
  | KanjiExercise
  | MultipleChoiceExercise
  | GrammarExercise
  | ReadingExercise
  | ListeningExercise
  | VocabularyExercise;

// Helper type guards
export function isFillExercise(exercise: Exercise): exercise is FillExercise {
  return exercise.type === 'fill';
}

export function isFillKanjiHiraganaExercise(exercise: Exercise): exercise is FillKanjiHiraganaExercise {
  return exercise.type === 'fill-kanji-hiragana';
}

export function isMultipleChoiceExercise(exercise: Exercise): exercise is MultipleChoiceExercise {
  return exercise.type === 'multiple-choice';
}

export function isGrammarExercise(exercise: Exercise): exercise is GrammarExercise {
  return exercise.type === 'grammar';
}

export function isReadingExercise(exercise: Exercise): exercise is ReadingExercise {
  return exercise.type === 'reading';
}

export function isFillHiraganaFromKanjiExercise(
  exercise: Exercise
): exercise is FillHiraganaFromKanjiExercise {
  return exercise.type === 'fill-hiragana-from-kanji';
}

export function isVocabularyExercise(exercise: Exercise): exercise is VocabularyExercise {
  return exercise.type === 'vocabulary';
}

// Exercise result for tracking user progress
export interface ExerciseResult {
  exerciseId: string;
  exerciseType: ExerciseType;
  isCorrect: boolean;
  userAnswer: string | number; // string for text, number for index
  correctAnswer: string | number;
  checkMethod: 'ai' | 'local';
  aiExplanation?: string;
  timestamp: Date;
}
