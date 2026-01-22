import { redirect } from 'next/navigation';
import { generateLessonStaticParams } from '@/lib/utils/lessonParams';

export function generateStaticParams() {
  return generateLessonStaticParams();
}

interface PageProps {
  params: {
    lessonNumber: string;
  };
}

export default function ExercisePage({ params }: PageProps) {
  redirect(`/lesson/${params.lessonNumber}/exercise/fillKanjiHiragana`);
}

