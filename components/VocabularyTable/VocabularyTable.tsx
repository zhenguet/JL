'use client'

import React, { useState } from 'react'
import { VocabularyWord } from '@/types/vocabulary'
import { useI18n } from '@/i18n/context'
import { Button } from '@/components'
import './VocabularyTable.css'

interface VocabularyTableProps {
  words: VocabularyWord[]
  showKanji?: boolean
}


export default function VocabularyTable({ words, showKanji = true }: VocabularyTableProps) {
  const { t } = useI18n()
  const typeLabels: Record<string, string> = {
    noun: t.vocabulary.typeNoun,
    verb: t.vocabulary.typeVerb,
    adjective: t.vocabulary.typeAdjective,
    adverb: t.vocabulary.typeAdverb,
    other: t.vocabulary.typeOther,
  }
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  if (words.length === 0) {
    return null
  }

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const groupedByType = words.reduce(
    (acc, word) => {
      if (!acc[word.type]) {
        acc[word.type] = []
      }
      acc[word.type].push(word)
      return acc
    },
    {} as Record<string, VocabularyWord[]>
  )

  return (
    <>
      {Object.entries(groupedByType).map(([type, typeWords]) => (
        <div key={type} className="vocab-section">
          <h3 className="vocab-type-title">{typeLabels[type] || type}</h3>
          <div className="vocab-table-wrapper">
            <table className="vocab-table">
              <thead>
                <tr>
                  <th>{t.vocabulary.kanji}</th>
                  <th>{t.vocabulary.hiragana}</th>
                  <th>{t.vocabulary.meaning}</th>
                  <th>{t.vocabulary.details}</th>
                </tr>
              </thead>
              <tbody>
                {typeWords.map((word, index) => {
                  const isExpanded = expandedIds.has(word.id)
                  const hasExplanation = word.explanation && word.explanation.content && word.explanation.content.length > 0
                  const shouldShowHiragana = !word.kanji || word.kanji !== word.hiragana

                  return (
                    <React.Fragment key={word.id || index}>
                      <tr className="vocab-row">
                        <td className="kanji-cell">
                          {word.kanji || <span className="no-kanji">-</span>}
                        </td>
                        <td className="hiragana-cell">
                          {shouldShowHiragana ? word.hiragana : '-'}
                        </td>
                        <td className="meaning-cell">{word.vi}</td>
                        <td className="detail-cell">
                          {hasExplanation && (
                            <Button
                              variant="secondary"
                              onClick={() => toggleExpand(word.id)}
                            >
                              {isExpanded ? t.vocabulary.collapse : t.vocabulary.expand}
                            </Button>
                          )}
                        </td>
                      </tr>
                      {isExpanded && hasExplanation && (
                        <tr className="vocab-detail-row">
                          <td colSpan={4} className="detail-content">
                            <div className="vocab-detail">
                              <div className="detail-section">
                                <h4>{t.vocabulary.explanation}:</h4>
                                <ul className="explanation-list">
                                  {word.explanation!.content.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  )
}

