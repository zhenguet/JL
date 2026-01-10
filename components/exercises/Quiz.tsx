'use client';

import { useMemo, useState } from 'react';
import { QuizQuestion, ShuffledQuestion } from '@/types/quiz';
import './quiz.css';

interface QuizProps {
  questions: QuizQuestion[];
  title?: string;
  shuffleOptions?: boolean;
}

const optionLabels = ['a', 'b', 'c', 'd'];

function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function shuffleArray<T>(array: T[], seed: number = 0): T[] {
  const shuffled = [...array];
  const random = seededRandom(seed);
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function buildShuffledQuestions(
  source: QuizQuestion[],
  shuffleOptions: boolean,
  shuffleKey: number = 0
): ShuffledQuestion[] {
  const baseList = shuffleArray([...source], shuffleKey);

  if (!shuffleOptions) {
    return baseList.map((question) => ({
      ...question,
      shuffledOptions: question.options,
      shuffledCorrectAnswer: question.correctAnswer,
    }));
  }

  return baseList.map((question, questionIndex) => {
    const originalOptions = [...question.options];
    const originalCorrectIndex = question.correctAnswer;
    const originalCorrectValue = originalOptions[originalCorrectIndex];

    const indices = originalOptions.map((_, index) => index);
    const questionSeed = shuffleKey * 1000 + question.id + questionIndex;
    const shuffledIndices = shuffleArray(indices, questionSeed);
    const shuffledOptions = shuffledIndices.map((idx) => originalOptions[idx]);

    const shuffledCorrectAnswer = shuffledIndices.findIndex(
      (idx) => idx === originalCorrectIndex
    );

    if (shuffledCorrectAnswer === -1) {
      console.warn('WARNING: shuffledCorrectAnswer is -1, using fallback');
      const fallbackIndex = shuffledOptions.findIndex(
        (opt) => opt.trim() === originalCorrectValue.trim()
      );
      if (fallbackIndex !== -1) {
        return {
          ...question,
          shuffledOptions,
          shuffledCorrectAnswer: fallbackIndex,
        };
      }
      console.error('ERROR: Fallback also failed!');
    }

    return {
      ...question,
      shuffledOptions,
      shuffledCorrectAnswer:
        shuffledCorrectAnswer >= 0 ? shuffledCorrectAnswer : 0,
    };
  });
}

export default function Quiz({
  questions,
  title,
  shuffleOptions = true,
}: QuizProps) {
  const [shuffleKey, setShuffleKey] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [showResults, setShowResults] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showFurigana, setShowFurigana] = useState(false);

  const originalQuestionsMap = useMemo(
    () => new Map(questions.map((q) => [q.id, q])),
    [questions]
  );

  const shuffledQuestions = useMemo(() => {
    return buildShuffledQuestions(questions, shuffleOptions, shuffleKey);
  }, [questions, shuffleOptions, shuffleKey]);

  const questionMap = useMemo(
    () => new Map(shuffledQuestions.map((q) => [q.id, q])),
    [shuffledQuestions]
  );

  const result = useMemo(() => {
    const correct = shuffledQuestions.reduce((total, question) => {
      const selected = selectedAnswers[question.id];
      return total + (selected === question.shuffledCorrectAnswer ? 1 : 0);
    }, 0);

    const totalQuestions = shuffledQuestions.length;
    const percentage =
      totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;

    return { correct, percentage };
  }, [selectedAnswers, shuffledQuestions]);

  const handleAnswerSelect = (questionId: number, optionIndex: number) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleCheckResult = () => {
    setScore(result.percentage);
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setShowAnswerKey(false);
    setScore(null);
  };

  const handleShuffle = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setShowAnswerKey(false);
    setScore(null);
    setShuffleKey((prev) => prev + 1);
  };

  const getOptionClass = (questionId: number, optionIndex: number) => {
    const isSelected = selectedAnswers[questionId] === optionIndex;
    const shuffledQuestion = questionMap.get(questionId);
    const isCorrect = shuffledQuestion
      ? optionIndex === shuffledQuestion.shuffledCorrectAnswer
      : false;
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
    const shuffledQuestion = questionMap.get(questionId);
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

  const shouldShowResultHeader = showResults || showAnswerKey;

  const getQuestionSummaryStatus = (question: ShuffledQuestion) => {
    const selected = selectedAnswers[question.id];

    if (selected === undefined) {
      return 'unanswered';
    }

    if (showResults || showAnswerKey) {
      if (selected === question.shuffledCorrectAnswer) {
        return 'correct';
      }
      return 'incorrect';
    }

    return 'answered';
  };

  const handleQuestionScroll = (questionId: number) => {
    const questionElement = document.getElementById(`question-${questionId}`);
    if (questionElement) {
      questionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`quiz-container ${showFurigana ? '' : 'hide-furigana'}`}>
      <div className="quiz-layout">
        <div className="quiz-main">
          <div className="quiz-header-wrapper">
            {title && <h2 className="quiz-title">{title}</h2>}
            {shouldShowResultHeader && (
              <div className="quiz-result-header">
                Kết quả: {result.correct} / {questions.length} ({' '}
                {result.percentage.toFixed(1)}% )
              </div>
            )}
            <div className="furigana-toggle">
              <button
                type="button"
                onClick={() => setShowFurigana(!showFurigana)}
                className={`btn-toggle-furigana ${
                  showFurigana ? 'active' : ''
                }`}
                title={showFurigana ? 'Ẩn chữ mềm' : 'Hiện chữ mềm'}
              >
                {showFurigana ? 'Ẩn chữ mềm' : 'Hiện chữ mềm'}
              </button>
            </div>
          </div>
          <form className="quiz-form">
            {shuffledQuestions.map((shuffledQuestion, index) => (
              <div
                key={shuffledQuestion.id}
                id={`question-${shuffledQuestion.id}`}
              >
                <hr className="style-one" />
                <div className="tracnghiem">
                  <div className="question">
                    <div className="bai_stt">
                      問{String(index + 1).padStart(2, '0')}:
                    </div>
                    <span
                      className="question-text"
                      dangerouslySetInnerHTML={{
                        __html: shuffledQuestion.question,
                      }}
                    />
                  </div>
                  <table className="table_tracnghiem">
                    <tbody>
                      {shuffledQuestion.shuffledOptions.map(
                        (option, optionIndex) => (
                          <tr
                            key={optionIndex}
                            className={`tr${
                              shuffledQuestion.id * 10 + optionIndex + 1
                            }`}
                          >
                            <td className="item1">
                              <input
                                id={`answer_${shuffledQuestion.id}${
                                  optionIndex + 1
                                }`}
                                type="radio"
                                name={`answer[${shuffledQuestion.id}]`}
                                checked={
                                  selectedAnswers[shuffledQuestion.id] ===
                                  optionIndex
                                }
                                onChange={() =>
                                  handleAnswerSelect(
                                    shuffledQuestion.id,
                                    optionIndex
                                  )
                                }
                                disabled={showResults || showAnswerKey}
                              />
                              <label
                                htmlFor={`answer_${shuffledQuestion.id}${
                                  optionIndex + 1
                                }`}
                                className={getOptionClass(
                                  shuffledQuestion.id,
                                  optionIndex
                                )}
                              >
                                <span className="option-label">
                                  {optionLabels[optionIndex]}.
                                </span>
                                <span className="option-text">{option}</span>
                              </label>
                              <span className="result-indicator">
                                {getQuestionResult(
                                  shuffledQuestion.id,
                                  optionIndex
                                )}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
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
                onClick={handleCheckResult}
                className="btn btn-danger"
                disabled={Object.keys(selectedAnswers).length === 0}
              >
                Kết Quả
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-success"
              >
                Làm Lại
              </button>
              <button
                type="button"
                onClick={handleShuffle}
                className="btn btn-secondary"
                title="Xáo trộn lại thứ tự câu hỏi và các lựa chọn"
              >
                Xáo Trộn
              </button>
            </div>
          </div>
        </div>
        <aside className="quiz-summary-desktop">
          <div className="quiz-summary-title">Danh sách câu hỏi</div>
          <div className="quiz-summary-grid">
            {shuffledQuestions.map((question, index) => {
              const status = getQuestionSummaryStatus(question);
              return (
                <div
                  key={question.id}
                  className={`quiz-summary-item quiz-summary-item-${status}`}
                  onClick={() => handleQuestionScroll(question.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {index + 1}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
