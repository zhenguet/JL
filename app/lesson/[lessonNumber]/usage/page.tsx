'use client'

import { vocabularyData } from '@/data/vocabulary'
import { EmptyMessage, PageTitle } from '@/components'
import { useI18n } from '@/i18n/context'
import './usage.css'

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

interface WordExplanation {
  title: string;
  content: string[];
}

export default function UsagePage({ params }: PageProps) {
  const { t } = useI18n();
  const lessonNumber = parseInt(params.lessonNumber, 10);
  const vocabulary = vocabularyData[lessonNumber] || [];

  const wordsWithExplanation = vocabulary
    .filter((word) => word.explanation !== undefined)
    .map((word) => {
      const shouldShowHiragana = !word.kanji || word.kanji !== word.hiragana;
      const displayWord = word.kanji || word.hiragana;
      const hiraganaPart = shouldShowHiragana ? ` (${word.hiragana})` : '';
      const title =
        word.explanation?.title ||
        `${displayWord}${hiraganaPart} - ${word.en} / ${word.vi}`;
      return {
        ...word,
        explanation: {
          title,
          content: word.explanation!.content,
        },
      };
    });

  if (wordsWithExplanation.length === 0) {
    return (
      <div className="usage-container">
        <PageTitle title={t.usage.title} lessonNumber={lessonNumber} />
        <EmptyMessage
          message={`${t.usage.noData} ${lessonNumber}`}
        />
      </div>
    );
  }

  return (
    <div className="usage-container">
      <PageTitle title={t.usage.title} lessonNumber={lessonNumber} />
      <p className="intro-text">
        {t.usage.intro}
      </p>

      <div className="explanations-list">
        {wordsWithExplanation.map((word, index) => (
          <div key={index} className="explanation-card">
            <div className="explanation-header">
              <div className="word-display">
                {word.kanji && <span className="word-kanji">{word.kanji}</span>}
                {(!word.kanji || word.kanji !== word.hiragana) && (
                  <span className="word-hiragana">{word.hiragana}</span>
                )}
                <span className="word-meaning">({word.vi})</span>
              </div>
            </div>
            <div className="explanation-content">
              {word.explanation && (
                <>
                  <h3 className="explanation-title">
                    {word.explanation.title}
                  </h3>
                  <ul className="explanation-list">
                    {word.explanation.content.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
