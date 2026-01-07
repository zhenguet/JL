import { Quiz } from '@/components/exercises';
import { sampleQuizData } from '@/data/quizData';

export default function QuizPage() {
  return (
    <div style={{ minHeight: '100vh', padding: '20px', background: '#f5f5f5' }}>
      <Quiz questions={sampleQuizData} title="Bài Tập Trắc Nghiệm" />
    </div>
  );
}
