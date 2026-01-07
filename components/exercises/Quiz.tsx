'use client';

import { useState, useMemo } from 'react';
import './quiz.css';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  /**
   * Question difficulty level: 1 (easiest) to 5 (hardest)
   * - 1: Basic questions, simple vocabulary, no kanji or with furigana
   * - 2: Medium questions, some kanji with furigana, basic grammar
   * - 3: Medium-hard questions, kanji present, more complex grammar
   * - 4: Hard questions, many kanji, advanced grammar, long sentences
   * - 5: Very hard questions, complex grammar, advanced vocabulary, very long sentences
   */
  difficulty?: number;
}

interface ShuffledQuestion extends QuizQuestion {
  shuffledOptions: string[];
  shuffledCorrectAnswer: number;
}

interface QuizProps {
  questions: QuizQuestion[];
  title?: string;
  shuffleOptions?: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Quiz({ questions, title, shuffleOptions = true }: QuizProps) {
  const [shuffleKey, setShuffleKey] = useState(0);

  const shuffledQuestions = useMemo(() => {
    const shuffledQuestionsList = shuffleArray([...questions]);

    if (!shuffleOptions) {
      return shuffledQuestionsList.map(q => ({
        ...q,
        shuffledOptions: q.options,
        shuffledCorrectAnswer: q.correctAnswer,
      }));
    }

    return shuffledQuestionsList.map(question => {
      const shuffledOptions = shuffleArray(question.options);
      const originalCorrectAnswer = question.options[question.correctAnswer];
      const shuffledCorrectAnswer = shuffledOptions.findIndex(
        opt => opt === originalCorrectAnswer
      );

      return {
        ...question,
        shuffledOptions,
        shuffledCorrectAnswer,
      };
    });
  }, [questions, shuffleOptions, shuffleKey]);

  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: number;
  }>({});
  const [showResults, setShowResults] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showFurigana, setShowFurigana] = useState(false);

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const calculateResult = useMemo(() => {
    if (!showResults && !showAnswerKey) {
      return { correct: 0, percentage: 0 };
    }
    const correct = shuffledQuestions.filter(
      q => selectedAnswers[q.id] === q.shuffledCorrectAnswer
    ).length;
    const percentage = questions.length > 0 ? (correct / questions.length) * 100 : 0;
    return { correct, percentage };
  }, [shuffledQuestions, selectedAnswers, showResults, showAnswerKey, questions.length]);

  const checkResult = () => {
    const correct = shuffledQuestions.filter(
      q => selectedAnswers[q.id] === q.shuffledCorrectAnswer
    ).length;
    const percentage = questions.length > 0 ? (correct / questions.length) * 100 : 0;
    setScore(percentage);
    setShowResults(true);
  };

  const resetResult = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setShowAnswerKey(false);
    setScore(null);
  };

  const shuffleQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setShowAnswerKey(false);
    setScore(null);
    setShuffleKey(prev => prev + 1);
  };

  const resultCorrect = () => {
    if (score !== null && score >= 60) {
      setShowAnswerKey(true);
    } else {
      alert('Bạn chỉ xem được đáp án khi làm đúng từ 60% trở lên');
    }
  };

  const getOptionClass = (questionId: number, optionIndex: number) => {
    const isSelected = selectedAnswers[questionId] === optionIndex;
    const shuffledQuestion = shuffledQuestions.find(q => q.id === questionId);
    const isCorrect = shuffledQuestion ? optionIndex === shuffledQuestion.shuffledCorrectAnswer : false;
    const classes = ['quiz-option'];

    if (showResults || showAnswerKey) {
      if (isCorrect) {
        classes.push('correct');
      } else if (isSelected && !isCorrect) {
        classes.push('incorrect');
      }
    } else if (isSelected) {
      classes.push('selected');
    }

    return classes.join(' ');
  };

  const getQuestionResult = (questionId: number, optionIndex: number) => {
    if (!showResults && !showAnswerKey) return null;
    const shuffledQuestion = shuffledQuestions.find(q => q.id === questionId);
    if (!shuffledQuestion) return null;

    const isCorrect = optionIndex === shuffledQuestion.shuffledCorrectAnswer;
    const isSelected = selectedAnswers[questionId] === optionIndex;

    if (isCorrect) {
      return <span className="result-correct">✓ Đúng</span>;
    }
    if (isSelected && !isCorrect) {
      return <span className="result-incorrect">✗ Sai</span>;
    }
    return null;
  };

  const labels = ['a', 'b', 'c', 'd'];

  return (
    <div className={`quiz-container ${showFurigana ? '' : 'hide-furigana'}`}>
      <div className="quiz-header-wrapper">
        {title && <h2 className="quiz-title">{title}</h2>}
        {showResults && (
          <div className="quiz-result-header">
            Kết quả: {calculateResult.correct} / {questions.length} ( {calculateResult.percentage.toFixed(1)}% )
          </div>
        )}
        <div className="furigana-toggle">
          <button
            type="button"
            onClick={() => setShowFurigana(!showFurigana)}
            className={`btn-toggle-furigana ${showFurigana ? 'active' : ''}`}
            title={showFurigana ? 'Ẩn chữ mềm' : 'Hiện chữ mềm'}
          >
            {showFurigana ? 'Ẩn chữ mềm' : 'Hiện chữ mềm'}
          </button>
        </div>
      </div>
      <form className="quiz-form">
        {shuffledQuestions.map((shuffledQuestion, index) => (
          <div key={shuffledQuestion.id}>
            <hr className="style-one" />
            <div className="tracnghiem">
              <div className="question">
                <div className="bai_stt">問{String(index + 1).padStart(2, '0')}:</div>
                <span
                  className="question-text"
                  dangerouslySetInnerHTML={{ __html: shuffledQuestion.question }}
                />
              </div>
              <table className="table_tracnghiem">
                <tbody>
                  {shuffledQuestion.shuffledOptions.map((option, optionIndex) => (
                    <tr
                      key={optionIndex}
                      className={`tr${shuffledQuestion.id * 10 + optionIndex + 1}`}
                    >
                      <td className="item1">
                        <input
                          id={`answer_${shuffledQuestion.id}${optionIndex + 1}`}
                          type="radio"
                          name={`answer[${shuffledQuestion.id}]`}
                          checked={selectedAnswers[shuffledQuestion.id] === optionIndex}
                          onChange={() => handleAnswerSelect(shuffledQuestion.id, optionIndex)}
                          disabled={showResults || showAnswerKey}
                        />
                        <label
                          htmlFor={`answer_${shuffledQuestion.id}${optionIndex + 1}`}
                          className={getOptionClass(shuffledQuestion.id, optionIndex)}
                        >
                          <span className="option-label">
                            {labels[optionIndex]}.
                          </span>
                          <span className="option-text">{option}</span>
                        </label>
                        <span className="result-indicator">
                          {getQuestionResult(shuffledQuestion.id, optionIndex)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        <hr className="style-one" />
      </form>
      <div className="quiz-actions-wrapper">
        <div className="quiz-actions">
          <button
            type="button"
            onClick={checkResult}
            className="btn btn-danger"
            disabled={Object.keys(selectedAnswers).length === 0}
          >
            Kết Quả
          </button>
          <button
            type="button"
            onClick={resetResult}
            className="btn btn-success"
          >
            Làm Lại
          </button>
          <button
            type="button"
            onClick={resultCorrect}
            className="btn btn-primary"
            title="Bạn chỉ xem được đáp án khi làm đúng từ 60% trở lên"
          >
            Đáp Án
          </button>
          <button
            type="button"
            onClick={shuffleQuiz}
            className="btn btn-secondary"
            title="Xáo trộn lại thứ tự câu hỏi và các lựa chọn"
          >
            Xáo Trộn
          </button>
        </div>
      </div>
    </div>
  );
}
