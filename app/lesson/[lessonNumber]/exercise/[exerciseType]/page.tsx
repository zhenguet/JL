import ExerciseClient from '../ExerciseClient';
import { routeToExerciseType } from '@/lib/utils/exerciseRoute';
import ExerciseTypePageClient from './ExerciseTypePageClient';

export function generateStaticParams() {
  const exerciseTypes = [
    'fillWord',
    'fillKanjiHiragana',
    'fillHiraganaFromKanji',
    'translate',
    'kanji',
    'multipleChoice',
    'grammar',
    'reading',
  ];

  const lessons = Array.from({ length: 50 }, (_, i) => i + 1);

  return lessons.flatMap((lessonNumber) =>
    exerciseTypes.map((exerciseType) => ({
      lessonNumber: String(lessonNumber),
      exerciseType,
    }))
  );
}

interface PageProps {
  params: {
    lessonNumber: string;
    exerciseType: string;
  };
}

export default function ExerciseTypePage({ params }: PageProps) {
  return <ExerciseTypePageClient params={params} />;
}

