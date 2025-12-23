import { ExerciseType } from '@/types/exercise';

export const EXERCISE_TYPE_TO_ROUTE: Record<ExerciseType, string> = {
  'fill': 'fillWord',
  'fill-kanji-hiragana': 'fillKanjiHiragana',
  'fill-hiragana-from-kanji': 'fillHiraganaFromKanji',
  'translate': 'translate',
  'kanji': 'kanji',
  'multiple-choice': 'multipleChoice',
  'grammar': 'grammar',
  'reading': 'reading',
  'listening': 'listening',
  'vocabulary': 'vocabulary',
};

export const ROUTE_TO_EXERCISE_TYPE: Record<string, ExerciseType> = Object.fromEntries(
  Object.entries(EXERCISE_TYPE_TO_ROUTE).map(([type, route]) => [route, type])
) as Record<string, ExerciseType>;

export function routeToExerciseType(route: string): ExerciseType | null {
  return ROUTE_TO_EXERCISE_TYPE[route] || null;
}

export function exerciseTypeToRoute(type: ExerciseType): string {
  return EXERCISE_TYPE_TO_ROUTE[type];
}

