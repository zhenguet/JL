import ExerciseClient from '../ExerciseClient';
import { routeToExerciseType } from '@/utils/exerciseRoute';

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
  const lessonNumber = parseInt(params.lessonNumber, 10);
  const exerciseType = routeToExerciseType(params.exerciseType);

  if (!exerciseType) {
    return (
      <div>
        <h2>Loại bài tập không hợp lệ</h2>
        <p>Không tìm thấy loại bài tập: {params.exerciseType}</p>
      </div>
    );
  }

  return <ExerciseClient lessonNumber={lessonNumber} exerciseType={exerciseType} />;
}

