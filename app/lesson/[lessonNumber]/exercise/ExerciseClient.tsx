'use client';

import { EmptyMessage, PageTitle } from '@/components';
import { vocabularyData } from '@/data/vocabulary';
import { useEffect, useRef, useState } from 'react';
import './exercise.css';

interface ExerciseClientProps {
  lessonNumber: number;
}

interface Exercise {
  type: string;
  question: string;
  answer: string;
  kanji?: string;
}

export default function ExerciseClient({ lessonNumber }: ExerciseClientProps) {
  const vocabulary = vocabularyData[lessonNumber] || [];
  const [exerciseType, setExerciseType] = useState<
    'fill' | 'translate' | 'kanji'
  >('fill');
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [checkMethod, setCheckMethod] = useState<'ai' | 'local' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    generateExercise();
  }, [exerciseType, vocabulary]);

  const generateExercise = () => {
    if (vocabulary.length === 0) return;

    const randomWord =
      vocabulary[Math.floor(Math.random() * vocabulary.length)];

    if (exerciseType === 'fill') {
      setCurrentExercise({
        type: 'fill',
        question: `Điền từ còn thiếu: "${randomWord.vi}" = ?`,
        answer: randomWord.hiragana,
        kanji: randomWord.kanji,
      });
    } else if (exerciseType === 'translate') {
      setCurrentExercise({
        type: 'translate',
        question: `Dịch sang tiếng Việt: "${randomWord.hiragana}"${
          randomWord.kanji ? ` (${randomWord.kanji})` : ''
        }`,
        answer: randomWord.vi,
      });
    } else if (exerciseType === 'kanji') {
      if (randomWord.kanji) {
        setCurrentExercise({
          type: 'kanji',
          question: `Kanji của "${randomWord.hiragana}" (${randomWord.vi}) là gì?`,
          answer: randomWord.kanji,
        });
      } else {
        generateExercise();
        return;
      }
    }

    setUserAnswer('');
    setShowResult(false);
    setAiExplanation('');
    setCheckMethod(null);
    setIsChecking(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const checkWithAI = async (
    question: string,
    answer: string,
    userAns: string,
    type: string
  ) => {
    try {
      const res = await fetch('/JL/api/ai/check/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          correctAnswer: answer,
          userAnswer: userAns,
          type,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        return { error: errorData.error || 'Server Error' };
      }
      return await res.json();
    } catch (error) {
      return { error: 'Network Error' };
    }
  };

  const handleSubmit = async () => {
    if (!currentExercise || !userAnswer.trim() || isChecking) return;

    setIsChecking(true);
    setCheckMethod(null);

    let correct = false;
    let explanation = '';
    let usedMethod: 'ai' | 'local' = 'local';

    // Try AI Check FIRST
    const aiResult = await checkWithAI(
      currentExercise.question,
      currentExercise.answer,
      userAnswer,
      currentExercise.type
    );

    if (aiResult && !aiResult.error) {
      // AI check succeeded
      correct = aiResult.isCorrect;
      explanation = aiResult.explanation;
      usedMethod = 'ai';
    } else {
      // AI failed, fallback to local check
      const normalizedUserAnswer = userAnswer.trim().toLowerCase();
      const normalizedCorrectAnswer = currentExercise.answer.trim().toLowerCase();
      const answerParts = normalizedCorrectAnswer
        .split(/[,、]/)
        .map((part) => part.trim());
      
      correct = answerParts.some(
        (part) =>
          normalizedUserAnswer.includes(part) ||
          part.includes(normalizedUserAnswer)
      );
      
      if (aiResult?.error) {
        explanation = `⚠️ AI lỗi (dùng local check): ${aiResult.error}`;
      }
      usedMethod = 'local';
    }

    setIsChecking(false);
    setShowResult(true);
    setTotal((prev) => prev + 1);
    setIsCorrect(correct);
    setAiExplanation(explanation);
    setCheckMethod(usedMethod);

    if (correct) {
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    generateExercise();
  };

  if (vocabulary.length === 0) {
    return (
      <div className="exercise-container">
        <PageTitle title="Bài tập" lessonNumber={lessonNumber} />
        <EmptyMessage
          message={`Chưa có dữ liệu từ vựng cho bài ${lessonNumber}`}
        />
      </div>
    );
  }

  return (
    <div className="exercise-container">
      <PageTitle title="Bài tập" lessonNumber={lessonNumber} />

      <div className="exercise-type-selector">
        <button
          className={`type-btn ${exerciseType === 'fill' ? 'active' : ''}`}
          onClick={() => setExerciseType('fill')}
        >
          Điền từ
        </button>
        <button
          className={`type-btn ${exerciseType === 'translate' ? 'active' : ''}`}
          onClick={() => setExerciseType('translate')}
        >
          Dịch
        </button>
        <button
          className={`type-btn ${exerciseType === 'kanji' ? 'active' : ''}`}
          onClick={() => setExerciseType('kanji')}
        >
          Kanji
        </button>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Điểm</span>
          <span className="stat-value">
            {score}/{total}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Streak</span>
          <span className="stat-value">🔥 {streak}</span>
        </div>
      </div>

      <div className="progress-container">
        <div
          className="progress-bar"
          style={{ width: `${total > 0 ? (score / total) * 100 : 0}%` }}
        ></div>
      </div>

      {currentExercise && (
        <div
          className={`exercise-card ${
            showResult ? (isCorrect ? 'card-correct' : 'card-incorrect') : ''
          }`}
        >
          <div className="exercise-question">
            <h3>{currentExercise.question}</h3>
          </div>

          <div className="exercise-answer">
            <input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (showResult) {
                    handleNext();
                  } else {
                    handleSubmit();
                  }
                }
              }}
              placeholder="Nhập câu trả lời..."
              disabled={showResult}
              className="answer-input"
              autoComplete="off"
            />
          </div>

          {showResult && (
            <div
              className={`result-message ${
                isCorrect ? 'correct' : 'incorrect'
              }`}
            >
              {isCorrect ? (
                <div className="result-content">
                  <span className="result-icon">✓</span>
                  <div>
                    <div className="result-header">
                      <span>Chính xác! +1 điểm</span>
                      {checkMethod && (
                        <span className={`check-badge ${checkMethod}`}>
                          {checkMethod === 'ai' ? '🤖 AI' : '💻 Local'}
                        </span>
                      )}
                    </div>
                    {aiExplanation && (
                      <div className="ai-explanation">{aiExplanation}</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="result-content">
                  <span className="result-icon">✗</span>
                  <div>
                    <div className="result-header">
                      <span>
                        Sai rồi. Đáp án:{' '}
                        <strong className="correct-answer-text">
                          {currentExercise.answer}
                        </strong>
                      </span>
                      {checkMethod && (
                        <span className={`check-badge ${checkMethod}`}>
                          {checkMethod === 'ai' ? '🤖 AI' : '💻 Local'}
                        </span>
                      )}
                    </div>
                    {aiExplanation && (
                      <div className="ai-explanation">{aiExplanation}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="exercise-actions">
            {!showResult ? (
              <button
                onClick={handleSubmit}
                className="btn btn-submit"
                disabled={isChecking}
              >
                {isChecking ? 'Đang kiểm tra...' : 'Kiểm tra'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="btn btn-next"
                ref={(btn) => btn?.focus()}
              >
                Tiếp tục ↵
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
