import { Quiz } from '@/components/exercises';
import { getQuizData } from '@/data/quizData';

export function generateStaticParams() {
  return Array.from({ length: 50 }, (_, i) => ({
    lessonNumber: String(i + 1),
  }));
}

export default function QuizPage({
  params,
}: {
  params: { lessonNumber: string };
}) {
  const lessonNumber = parseInt(params.lessonNumber, 10);
  const questions = getQuizData(lessonNumber);

  return (
    <Quiz
      questions={questions}
      title={`Bài Tập Trắc Nghiệm - Bài ${lessonNumber}`}
      shuffleOptions={true}
    />
  );
}
