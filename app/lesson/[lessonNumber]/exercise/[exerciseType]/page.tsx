import ExerciseClient from '../ExerciseClient';
import { routeToExerciseType } from '@/lib/utils/exerciseRoute';
import ExerciseTypePageClient from './ExerciseTypePageClient';
import { generateLessonStaticParams } from '@/lib/utils/lessonParams';

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

  const lessons = generateLessonStaticParams();

  return lessons.flatMap(({ lessonNumber }) =>
    exerciseTypes.map((exerciseType) => ({
      lessonNumber,
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

