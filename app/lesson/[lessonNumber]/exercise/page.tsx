import { redirect } from 'next/navigation';

export function generateStaticParams() {
  return Array.from({ length: 50 }, (_, i) => ({
    lessonNumber: String(i + 1),
  }));
}

interface PageProps {
  params: {
    lessonNumber: string;
  };
}

export default function ExercisePage({ params }: PageProps) {
  redirect(`/lesson/${params.lessonNumber}/exercise/fillWord`);
}

