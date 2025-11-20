'use client';

import { EmptyMessage, PageTitle } from '@/components';
import { MultipleChoice, ReadingPassage } from '@/components/exercises';
import { vocabularyData } from '@/data/vocabulary';
import { getGrammarExercises, getRandomGrammarExercise } from '@/data/grammarExercises';
import { getMultipleChoiceExercises, getRandomMultipleChoiceExercise } from '@/data/multipleChoiceExercises';
import { getReadingExercises, getRandomReadingExercise } from '@/data/readingExercises';
import { Exercise, ExerciseType, isGrammarExercise, isMultipleChoiceExercise, isReadingExercise } from '@/types/exercise';
import { useEffect, useRef, useState } from 'react';
import './exercise.css';

interface ExerciseClientProps {
  lessonNumber: number;
}

export default function ExerciseClient({ lessonNumber }: ExerciseClientProps) {
  const vocabulary = vocabularyData[lessonNumber] || [];
  const [exerciseType, setExerciseType] = useState<ExerciseType>('fill');
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [readingAnswers, setReadingAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [checkMethod, setCheckMethod] = useState<'ai' | 'local' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    generateExercise();
  }, [exerciseType, vocabulary]);

  const generateWithAI = async (type: ExerciseType): Promise<Exercise | null> => {
    try {
      const res = await fetch('/JL/api/ai/generate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, lessonNumber }),
      });

      if (!res.ok) {
        console.warn('AI generation failed, using local data');
        return null;
      }

      const data = await res.json();
      return data.exercise;
    } catch (error) {
      console.warn('AI generation error:', error);
      return null;
    }
  };

  const generateExercise = async () => {
    console.log('generateExercise called', { exerciseType, vocabLength: vocabulary.length });
    setIsGenerating(true);
    let exercise: Exercise | null = null;

    if (exerciseType === 'fill') {
      if (vocabulary.length === 0) {
        console.log('Vocabulary empty, returning');
        setIsGenerating(false);
        return;
      }
      const randomWord = vocabulary[Math.floor(Math.random() * vocabulary.length)];
      console.log('Selected word:', randomWord);
      exercise = {
        id: `fill-${Date.now()}`,
        type: 'fill',
        question: `Điền từ còn thiếu: "${randomWord.vi}" = ?`,
        answer: randomWord.hiragana,
        hint: randomWord.kanji,
        kanji: randomWord.kanji,
      };
    } else if (exerciseType === 'translate') {
      if (vocabulary.length === 0) return;
      const randomWord = vocabulary[Math.floor(Math.random() * vocabulary.length)];
      exercise = {
        id: `translate-${Date.now()}`,
        type: 'translate',
        question: `Dịch sang tiếng Việt: "${randomWord.hiragana}"${
          randomWord.kanji ? ` (${randomWord.kanji})` : ''
        }`,
        answer: randomWord.vi,
        kanji: randomWord.kanji,
      };
    } else if (exerciseType === 'kanji') {
      const kanjiWords = vocabulary.filter(w => w.kanji);
      if (kanjiWords.length === 0) {
        generateExercise();
        return;
      }
      const randomWord = kanjiWords[Math.floor(Math.random() * kanjiWords.length)];
      exercise = {
        id: `kanji-${Date.now()}`,
        type: 'kanji',
        question: `Kanji của "${randomWord.hiragana}" (${randomWord.vi}) là gì?`,
        answer: randomWord.kanji!,
        hiragana: randomWord.hiragana,
      };
    } else if (exerciseType === 'grammar' || exerciseType === 'multiple-choice' || exerciseType === 'reading') {
      // Try AI generation first
      exercise = await generateWithAI(exerciseType);
      
      // Fallback to local data if AI fails
      if (!exercise) {
        if (exerciseType === 'grammar') {
          exercise = getRandomGrammarExercise(lessonNumber);
        } else if (exerciseType === 'multiple-choice') {
          exercise = getRandomMultipleChoiceExercise(lessonNumber);
        } else if (exerciseType === 'reading') {
          exercise = getRandomReadingExercise(lessonNumber);
        }
      }
    }

    if (!exercise) {
      // No exercises available for this type
      setCurrentExercise(null);
      setIsGenerating(false);
      return;
    }

    setCurrentExercise(exercise);
    setUserAnswer('');
    setSelectedOptionIndex(null);
    setReadingAnswers([]);
    setShowResult(false);
    setAiExplanation('');
    setCheckMethod(null);
    setIsChecking(false);
    setIsGenerating(false);
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
    if (!currentExercise || isChecking) return;

    // Validate input based on exercise type
    if (isMultipleChoiceExercise(currentExercise) || isGrammarExercise(currentExercise)) {
      if (selectedOptionIndex === null) return;
    } else if (isReadingExercise(currentExercise)) {
      // Reading exercises are handled differently
      return;
    } else {
      if (!userAnswer.trim()) return;
    }

    setIsChecking(true);
    setCheckMethod(null);

    let correct = false;
    let explanation = '';
    let usedMethod: 'ai' | 'local' = 'local';

    // For multiple choice and grammar, check locally first (simple index comparison)
    if (isMultipleChoiceExercise(currentExercise) || isGrammarExercise(currentExercise)) {
      correct = selectedOptionIndex === currentExercise.correctIndex;
      explanation = currentExercise.explanation || '';
      usedMethod = 'local'; // Multiple choice doesn't need AI
    } else {
      // For text-based answers (fill, translate, kanji), try AI first
      const aiResult = await checkWithAI(
        currentExercise.question,
        'answer' in currentExercise ? currentExercise.answer : '',
        userAnswer,
        currentExercise.type
      );

      if (aiResult && !aiResult.error) {
        correct = aiResult.isCorrect;
        explanation = aiResult.explanation;
        usedMethod = 'ai';
      } else {
        // AI failed, fallback to local check
        const normalizedUserAnswer = userAnswer.trim().toLowerCase();
        const normalizedCorrectAnswer = ('answer' in currentExercise ? currentExercise.answer : '').trim().toLowerCase();
        const answerParts = normalizedCorrectAnswer
          .split(/[,、]/)
          .map((part) => part.trim());
        
        correct = answerParts.some(
          (part) =>
            normalizedUserAnswer.includes(part) ||
            part.includes(normalizedUserAnswer)
        );
        
        if (aiResult?.error) {
          // Only show error in development, hide in production (expected on GitHub Pages)
          if (process.env.NODE_ENV === 'development') {
            explanation = `⚠️ AI lỗi (dùng local check): ${aiResult.error}`;
          }
        }
        usedMethod = 'local';
      }
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

  const handleReadingSubmit = (answers: number[]) => {
    if (!currentExercise || !isReadingExercise(currentExercise)) return;

    setReadingAnswers(answers);
    setIsChecking(true);

    // Check all answers
    const correctCount = answers.filter((ans, idx) => 
      ans === currentExercise.questions[idx].correctIndex
    ).length;
    
    const totalQuestions = currentExercise.questions.length;
    const allCorrect = correctCount === totalQuestions;

    setIsChecking(false);
    setShowResult(true);
    setTotal((prev) => prev + totalQuestions);
    setScore((prev) => prev + correctCount);
    setIsCorrect(allCorrect);
    setCheckMethod('local');
    setAiExplanation(`Đúng ${correctCount}/${totalQuestions} câu`);

    if (allCorrect) {
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const renderExerciseInput = () => {
    if (!currentExercise) return null;

    // Reading exercises use a special component
    if (isReadingExercise(currentExercise)) {
      return (
        <ReadingPassage
          exercise={currentExercise}
          onSubmit={handleReadingSubmit}
          showResult={showResult}
          userAnswers={readingAnswers}
          disabled={isChecking}
        />
      );
    }

    if (isMultipleChoiceExercise(currentExercise) || isGrammarExercise(currentExercise)) {
      return (
        <MultipleChoice
          question={isGrammarExercise(currentExercise) ? currentExercise.sentence : currentExercise.question}
          options={currentExercise.options}
          selectedIndex={selectedOptionIndex}
          onSelect={setSelectedOptionIndex}
          disabled={showResult}
          correctIndex={showResult ? currentExercise.correctIndex : undefined}
          showResult={showResult}
        />
      );
    }

    // Text input for fill, translate, kanji
    return (
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
    );
  };

  const getCorrectAnswer = () => {
    if (!currentExercise) return '';
    if (isMultipleChoiceExercise(currentExercise) || isGrammarExercise(currentExercise)) {
      return currentExercise.options[currentExercise.correctIndex];
    }
    return 'answer' in currentExercise ? currentExercise.answer : '';
  };

  return (
    <div className="exercise-container">
      <PageTitle title="Bài tập" lessonNumber={lessonNumber} />

      <div className="exercise-type-selector">
        <button
          className={`type-btn ${exerciseType === 'fill' ? 'active' : ''}`}
          onClick={() => setExerciseType('fill')}
        >
          📝 Điền từ
        </button>
        <button
          className={`type-btn ${exerciseType === 'translate' ? 'active' : ''}`}
          onClick={() => setExerciseType('translate')}
        >
          🔄 Dịch
        </button>
        <button
          className={`type-btn ${exerciseType === 'kanji' ? 'active' : ''}`}
          onClick={() => setExerciseType('kanji')}
        >
          ✍️ Kanji
        </button>
        <button
          className={`type-btn ${exerciseType === 'grammar' ? 'active' : ''}`}
          onClick={() => setExerciseType('grammar')}
        >
          📚 Ngữ pháp
        </button>
        <button
          className={`type-btn ${exerciseType === 'multiple-choice' ? 'active' : ''}`}
          onClick={() => setExerciseType('multiple-choice')}
        >
          ✅ Trắc nghiệm
        </button>
        <button
          className={`type-btn ${exerciseType === 'reading' ? 'active' : ''}`}
          onClick={() => setExerciseType('reading')}
        >
          📖 Đọc hiểu
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

      {isGenerating ? (
        <div className="loading-container">
          <div className="generating-indicator">
            <span className="spinner">⏳</span> Đang tạo câu hỏi mới...
          </div>
        </div>
      ) : !currentExercise ? (
        <EmptyMessage
          message={
            vocabulary.length === 0 && ['fill', 'translate', 'kanji'].includes(exerciseType)
              ? `Chưa có dữ liệu từ vựng cho bài ${lessonNumber}`
              : `Chưa có bài tập ${exerciseType} cho bài ${lessonNumber}`
          }
        />
      ) : (
        <div
          className={`exercise-card ${
            showResult ? (isCorrect ? 'card-correct' : 'card-incorrect') : ''
          }`}
        >
          <div className="exercise-question">
            <h3>
              {currentExercise.question}
              {currentExercise.id.includes('-ai-') && (
                <span className="ai-badge" title="Câu hỏi được tạo bởi AI">🤖 AI</span>
              )}
            </h3>
          </div>

          {renderExerciseInput()}

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
                          {getCorrectAnswer()}
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
