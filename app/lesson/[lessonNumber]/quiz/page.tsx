import QuizClient from './QuizClient';

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

  return <QuizClient lessonNumber={lessonNumber} />;
}
