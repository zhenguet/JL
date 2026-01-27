import QuizClient from './QuizClient';
import { generateLessonStaticParams } from '@/lib/utils/lessonParams';

export function generateStaticParams() {
  return generateLessonStaticParams();
}

export default function QuizPage({
  params,
}: {
  params: { lessonNumber: string };
}) {
  const lessonNumber = parseInt(params.lessonNumber, 10);

  return <QuizClient lessonNumber={lessonNumber} />;
}
