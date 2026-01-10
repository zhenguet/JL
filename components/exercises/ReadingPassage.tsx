'use client';

import { MultipleChoice } from '@/components/exercises';
import { ReadingExercise } from '@/types/exercise';
import { useState } from 'react';
import { useI18n } from '@/i18n/context';
import './readingPassage.css';

interface ReadingPassageProps {
  exercise: ReadingExercise;
  onSubmit: (answers: number[]) => void;
  showResult?: boolean;
  userAnswers?: number[];
  disabled?: boolean;
}

export default function ReadingPassage({
  exercise,
  onSubmit,
  showResult = false,
  userAnswers = [],
  disabled = false
}: ReadingPassageProps) {
  const { t } = useI18n();
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(exercise.questions.length).fill(null)
  );

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (selectedAnswers.some(ans => ans === null)) {
      alert(t.reading.pleaseAnswerAll);
      return;
    }
    onSubmit(selectedAnswers as number[]);
  };

  const allAnswered = selectedAnswers.every(ans => ans !== null);

  return (
    <div className="reading-passage-container">
      <div className="passage-section">
        <h4 className="passage-title">📖 {t.reading.passage}</h4>
        <div className="passage-content">
          {exercise.passage.split('\n').map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      </div>

      <div className="questions-section">
        <h4 className="questions-title">❓ {t.reading.questions}</h4>
        {exercise.questions.map((question, idx) => (
          <div key={idx} className="reading-question">
            <div className="question-number">{t.reading.question} {idx + 1}</div>
            <MultipleChoice
              question={question.question}
              options={question.options}
              selectedIndex={showResult ? (userAnswers[idx] ?? null) : selectedAnswers[idx]}
              onSelect={(optionIdx) => handleAnswerSelect(idx, optionIdx)}
              disabled={disabled || showResult}
              correctIndex={showResult ? question.correctIndex : undefined}
              showResult={showResult}
            />
          </div>
        ))}
      </div>

      {!showResult && (
        <div className="reading-actions">
          <button
            onClick={handleSubmit}
            className="btn btn-submit"
            disabled={!allAnswered || disabled}
          >
            {t.reading.submit} ({selectedAnswers.filter(a => a !== null).length}/{exercise.questions.length})
          </button>
        </div>
      )}
    </div>
  );
}
