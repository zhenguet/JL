'use client';

import { EmptyMessage, PageTitle } from '@/components';
import { MultipleChoice, ReadingPassage } from '@/components/exercises';
import { getRandomGrammarExercise } from '@/data/grammarExercises';
import { getRandomMultipleChoiceExercise } from '@/data/multipleChoiceExercises';
import { getRandomReadingExercise } from '@/data/readingExercises';
import { vocabularyData } from '@/data/vocabulary';
import { VocabularyWord } from '@/types/vocabulary';
import {
  Exercise,
  ExerciseType,
  FillHiraganaFromKanjiExercise,
  FillExercise,
  FillKanjiHiraganaExercise,
  isFillKanjiHiraganaExercise,
  isFillHiraganaFromKanjiExercise,
  isGrammarExercise,
  isMultipleChoiceExercise,
  isReadingExercise,
  KanjiExercise,
  TranslateExercise,
} from '@/types/exercise';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { exerciseTypeToRoute } from '@/utils/exerciseRoute';
import './exercise.css';

interface ExerciseClientProps {
  lessonNumber: number;
  exerciseType: ExerciseType;
}

const EXERCISE_TYPES: Array<{
  type: ExerciseType;
  label: string;
  icon: string;
}> = [
  { type: 'fill', label: 'Điền từ', icon: '📝' },
  { type: 'fill-kanji-hiragana', label: 'Điền Kanji/Hiragana', icon: '✏️' },
  {
    type: 'fill-hiragana-from-kanji',
    label: 'Điền chữ mềm (Kanji + nghĩa)',
    icon: '🖋️',
  },
];

const VOCABULARY_EXERCISE_TYPES: ExerciseType[] = [
  'fill',
  'fill-kanji-hiragana',
  'fill-hiragana-from-kanji',
  'kanji',
];

function getRandomWord(
  words: VocabularyWord[],
  usedWordIds: Set<string>
): { word: VocabularyWord; shouldReset: boolean } {
  let availableWords = words.filter((w) => !usedWordIds.has(w.id));
  const shouldReset = availableWords.length === 0;
  if (shouldReset) {
    availableWords = words;
  }
  const randomWord =
    availableWords[Math.floor(Math.random() * availableWords.length)];
  return { word: randomWord, shouldReset };
}

function createFillExercise(word: VocabularyWord): FillExercise {
  return {
    id: `fill-${Date.now()}`,
    type: 'fill',
    question: `Điền từ còn thiếu: "${word.vi}" = ?`,
    answer: word.hiragana,
    hint: word.kanji,
    kanji: word.kanji,
  };
}

function createTranslateExercise(word: VocabularyWord): TranslateExercise {
  const shouldShowHiragana = !word.kanji || word.kanji !== word.hiragana;
  const hiraganaPart = shouldShowHiragana ? `"${word.hiragana}"` : '';
  const kanjiPart = word.kanji ? `"${word.kanji}"` : '';
  const question = shouldShowHiragana
    ? `Dịch sang tiếng Việt: ${hiraganaPart}${word.kanji ? ` (${word.kanji})` : ''}`
    : `Dịch sang tiếng Việt: ${kanjiPart}`;
  return {
    id: `translate-${Date.now()}`,
    type: 'translate',
    question,
    answer: word.vi,
    kanji: word.kanji,
  };
}

function createKanjiExercise(word: VocabularyWord): KanjiExercise {
  const shouldShowHiragana = !word.kanji || word.kanji !== word.hiragana;
  const question = shouldShowHiragana
    ? `Kanji của "${word.hiragana}" (${word.vi}) là gì?`
    : `Kanji của từ này (${word.vi}) là gì?`;
  return {
    id: `kanji-${Date.now()}`,
    type: 'kanji',
    question,
    answer: word.kanji!,
    hiragana: word.hiragana,
  };
}

function createFillKanjiHiraganaExercise(
  word: VocabularyWord
): FillKanjiHiraganaExercise {
  const shouldShowHiragana = !word.kanji || word.kanji !== word.hiragana;
  const question = shouldShowHiragana
    ? `${word.kanji}　（${word.hiragana}） = ? (${word.vi})`
    : `${word.kanji} = ? (${word.vi})`;
  return {
    id: `fill-kanji-hiragana-${Date.now()}`,
    type: 'fill-kanji-hiragana',
    question,
    kanji: word.kanji,
    hiragana: word.hiragana,
  };
}

function createFillHiraganaFromKanjiExercise(
  word: VocabularyWord
): FillHiraganaFromKanjiExercise {
  return {
    id: `fill-hiragana-from-kanji-${Date.now()}`,
    type: 'fill-hiragana-from-kanji',
    question: `${word.kanji} (${word.vi}) đọc là gì?`,
    kanji: word.kanji,
    meaningVi: word.vi,
    answer: word.hiragana,
  };
}

function cleanText(text: string, toLowerCase = false): string {
  let cleaned = text
    .replace(/[~～]/g, '')
    .replace(/\(.*?\)|（.*?）/g, '')
    .replace(/[「」『』]/g, '')
    .replace(/\.{2,}/g, '')
    .replace(/[．]{2,}/g, '')
    .replace(/[!！.,。、，；;?？]/g, '')
    .trim();
  return toLowerCase ? cleaned.toLowerCase() : cleaned;
}

function checkFillKanjiHiragana(
  exercise: FillKanjiHiraganaExercise,
  userAnswer: string
): { correct: boolean; explanation: string } {
  const normalizedUserAnswer = cleanText(userAnswer);
  const normalizedKanji = cleanText(exercise.kanji);
  const normalizedHiragana = cleanText(exercise.hiragana);

  const correct =
    normalizedUserAnswer === normalizedKanji ||
    normalizedUserAnswer === normalizedHiragana;

  const explanation = correct
    ? `Chính xác! Bạn có thể điền "${exercise.kanji}" (kanji) hoặc "${exercise.hiragana}" (hiragana).`
    : `Đáp án có thể là "${exercise.kanji}" (kanji) hoặc "${exercise.hiragana}" (hiragana).`;

  return { correct, explanation };
}

function checkFillHiraganaFromKanji(
  exercise: FillHiraganaFromKanjiExercise,
  userAnswer: string
): { correct: boolean; explanation: string } {
  const normalizedUserAnswer = cleanText(userAnswer);
  const normalizedAnswer = cleanText(exercise.answer);

  const correct = normalizedUserAnswer === normalizedAnswer;
  const explanation = correct
    ? 'Đúng cách đọc hiragana.'
    : `Cách đọc đúng: ${exercise.answer}`;

  return { correct, explanation };
}

function checkTextAnswer(userAnswer: string, correctAnswer: string): boolean {
  const normalizedUserAnswer = cleanText(userAnswer, true);
  const answerParts = correctAnswer
    .split(/[,、\/;]/)
    .map((part) => cleanText(part, true));

  const exactMatch = answerParts.some((part) => part === normalizedUserAnswer);

  if (exactMatch) return true;

  if (normalizedUserAnswer.length > 2) {
    return answerParts.some((part) => part.includes(normalizedUserAnswer));
  }

  return false;
}

export default function ExerciseClient({ lessonNumber, exerciseType }: ExerciseClientProps) {
  const router = useRouter();
  const vocabulary = vocabularyData[lessonNumber] || [];
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null
  );
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
  const [usedWordIds, setUsedWordIds] = useState<Set<string>>(new Set());
  const usedWordIdsRef = useRef<Set<string>>(new Set());
  const [answerHistory, setAnswerHistory] = useState<
    Array<{
      id: string;
      question: string;
      correctAnswer: string;
      userAnswer: string;
      correct: boolean;
    }>
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const newSet = new Set<string>();
    setUsedWordIds(newSet);
    usedWordIdsRef.current = newSet;
    generateExercise();
  }, [exerciseType, vocabulary]);

  const generateWithAI = async (
    type: ExerciseType
  ): Promise<Exercise | null> => {
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

  const generateVocabularyExercise = (): Exercise | null => {
    if (vocabulary.length === 0) {
      setIsGenerating(false);
      return null;
    }

    const { word, shouldReset } = getRandomWord(
      vocabulary,
      usedWordIdsRef.current
    );

    if (shouldReset) {
      usedWordIdsRef.current = new Set();
    }
    usedWordIdsRef.current.add(word.id);
    setUsedWordIds(new Set(usedWordIdsRef.current));

    switch (exerciseType) {
      case 'fill':
        return createFillExercise(word);
      case 'kanji':
        if (!word.kanji) {
          return generateVocabularyExercise();
        }
        return createKanjiExercise(word);
      case 'fill-kanji-hiragana':
        if (!word.kanji) {
          setIsGenerating(false);
          return null;
        }
        return createFillKanjiHiraganaExercise(word);
      case 'fill-hiragana-from-kanji':
        if (!word.kanji) {
          return generateVocabularyExercise();
        }
        return createFillHiraganaFromKanjiExercise(word);
      default:
        return null;
    }
  };

  const generateExercise = async () => {
    setIsGenerating(true);
    let exercise: Exercise | null = null;

    if (VOCABULARY_EXERCISE_TYPES.includes(exerciseType)) {
      exercise = generateVocabularyExercise();
    } else if (
      exerciseType === 'grammar' ||
      exerciseType === 'multiple-choice' ||
      exerciseType === 'reading'
    ) {
      exercise = await generateWithAI(exerciseType);
      if (!exercise) {
        switch (exerciseType) {
          case 'grammar':
            exercise = getRandomGrammarExercise(lessonNumber);
            break;
          case 'multiple-choice':
            exercise = getRandomMultipleChoiceExercise(lessonNumber);
            break;
          case 'reading':
            exercise = getRandomReadingExercise(lessonNumber);
            break;
        }
      }
    }

    if (!exercise) {
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

    if (
      isMultipleChoiceExercise(currentExercise) ||
      isGrammarExercise(currentExercise)
    ) {
      if (selectedOptionIndex === null) return;
    } else if (isReadingExercise(currentExercise)) {
      return;
    } else {
      if (!userAnswer.trim()) return;
    }

    setIsChecking(true);
    setCheckMethod(null);

    let correct = false;
    let explanation = '';
    let usedMethod: 'ai' | 'local' = 'local';

    if (
      isMultipleChoiceExercise(currentExercise) ||
      isGrammarExercise(currentExercise)
    ) {
      correct = selectedOptionIndex === currentExercise.correctIndex;
      explanation = currentExercise.explanation || '';
      usedMethod = 'local';
    } else if (isFillKanjiHiraganaExercise(currentExercise)) {
      const result = checkFillKanjiHiragana(currentExercise, userAnswer);
      correct = result.correct;
      explanation = result.explanation;
      usedMethod = 'local';
    } else if (isFillHiraganaFromKanjiExercise(currentExercise)) {
      const result = checkFillHiraganaFromKanji(currentExercise, userAnswer);
      correct = result.correct;
      explanation = result.explanation;
      usedMethod = 'local';
    } else {
      const answer = 'answer' in currentExercise ? currentExercise.answer : '';
      const aiResult = await checkWithAI(
        currentExercise.question,
        answer,
        userAnswer,
        currentExercise.type
      );

      if (aiResult && !aiResult.error) {
        correct = aiResult.isCorrect;
        explanation = aiResult.explanation;
        usedMethod = 'ai';
      } else {
        correct = checkTextAnswer(userAnswer, answer);
        if (aiResult?.error && process.env.NODE_ENV === 'development') {
          explanation = `⚠️ AI lỗi (dùng local check): ${aiResult.error}`;
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

    if (VOCABULARY_EXERCISE_TYPES.includes(currentExercise.type)) {
      const correctAnswer = getCorrectAnswer();
      setAnswerHistory((prev) => [
        ...prev,
        {
          id: currentExercise.id,
          question: currentExercise.question,
          correctAnswer,
          userAnswer: userAnswer || '',
          correct,
        },
      ]);
    }

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

    const correctCount = answers.filter(
      (ans, idx) => ans === currentExercise.questions[idx].correctIndex
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

    if (
      isMultipleChoiceExercise(currentExercise) ||
      isGrammarExercise(currentExercise)
    ) {
      return (
        <MultipleChoice
          question={
            isGrammarExercise(currentExercise)
              ? currentExercise.sentence
              : currentExercise.question
          }
          options={currentExercise.options}
          selectedIndex={selectedOptionIndex}
          onSelect={setSelectedOptionIndex}
          disabled={showResult}
          correctIndex={showResult ? currentExercise.correctIndex : undefined}
          showResult={showResult}
        />
      );
    }

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
    if (
      isMultipleChoiceExercise(currentExercise) ||
      isGrammarExercise(currentExercise)
    ) {
      return currentExercise.options[currentExercise.correctIndex];
    }
    if (isFillKanjiHiraganaExercise(currentExercise)) {
      return `${currentExercise.kanji} hoặc ${currentExercise.hiragana}`;
    }
    if (isFillHiraganaFromKanjiExercise(currentExercise)) {
      return currentExercise.answer;
    }
    return 'answer' in currentExercise ? currentExercise.answer : '';
  };

  const isEmptyMessage =
    vocabulary.length === 0 && VOCABULARY_EXERCISE_TYPES.includes(exerciseType);

  const handleExerciseTypeChange = (type: ExerciseType) => {
    const route = exerciseTypeToRoute(type);
    router.push(`/lesson/${lessonNumber}/exercise/${route}`);
  };

  return (
    <div className="exercise-container">
      <PageTitle title="Bài tập" lessonNumber={lessonNumber} />

      <div className="exercise-type-selector">
        {EXERCISE_TYPES.map(({ type, label, icon }) => (
          <button
            key={type}
            className={`type-btn ${exerciseType === type ? 'active' : ''}`}
            onClick={() => handleExerciseTypeChange(type)}
          >
            {icon} {label}
          </button>
        ))}
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
            isEmptyMessage
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
                <span className="ai-badge" title="Câu hỏi được tạo bởi AI">
                  🤖 AI
                </span>
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

      {answerHistory.length > 0 && (
        <div className="practiced-words">
          <div className="flex items-center justify-between gap-2">
            <span className="stat-label">
              Từ đã làm ({answerHistory.length})
            </span>
            <div>
              <span className="correct-count">
                {answerHistory.filter((item) => item.correct).length}
              </span>
              /
              <span className="incorrect-count">
                {answerHistory.filter((item) => !item.correct).length}
              </span>
            </div>
          </div>
          <div className="practiced-words-list">
            {[...answerHistory].reverse().map((item) => (
              <div
                key={item.id}
                className={`practiced-word ${
                  item.correct ? 'correct' : 'incorrect'
                }`}
              >
                <span className="history-left">
                  {item.question}
                  {item.correctAnswer ? ` — ${item.correctAnswer}` : ''}
                </span>
                <span className="history-answer">
                  <span className="history-text">
                    {item.userAnswer || '(trống)'}
                  </span>
                  <span
                    className={`history-icon ${
                      item.correct ? 'correct' : 'incorrect'
                    }`}
                  >
                    {item.correct ? '✓' : '✗'}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
