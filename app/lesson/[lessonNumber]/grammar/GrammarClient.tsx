'use client'

import { grammarData } from '@/data/grammar'
import { GrammarPoint } from '@/types/grammar'
import { useState } from 'react'
import React from 'react'
import { EmptyMessage, PageTitle, Button } from '@/components'
import { useI18n } from '@/i18n/context'
import './grammar.css'

interface GrammarClientProps {
  lessonNumber: number
}

export default function GrammarClient({ lessonNumber }: GrammarClientProps) {
  const { t } = useI18n()
  const grammar = grammarData[lessonNumber] || []
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  if (grammar.length === 0) {
    return (
      <div className="grammar-list">
        <PageTitle title={t.grammar.title} lessonNumber={lessonNumber} />
        <EmptyMessage message={`${t.grammar.noData} ${lessonNumber}`} />
      </div>
    )
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

  return (
    <div className="grammar-list">
      <PageTitle
        title={t.grammar.title}
        lessonNumber={lessonNumber}
        count={grammar.length}
        countLabel={t.common.grammarPoint}
      />

      <div className="grammar-table-wrapper">
        <table className="grammar-table">
          <thead>
            <tr>
              <th>{t.grammar.titleHeader}</th>
              <th>{t.grammar.structure}</th>
              <th>{t.grammar.example}</th>
              <th>{t.grammar.details}</th>
            </tr>
          </thead>
          <tbody>
          {grammar.map((point, index) => {
            const isExpanded = expandedIds.has(point.id)
            const firstExample = point.examples[0]

            return (
              <React.Fragment key={point.id || index}>
                <tr className="grammar-row">
                  <td className="title-cell">{point.title}</td>
                  <td className="structure-cell">
                    <code>{point.structure}</code>
                  </td>
                  <td className="example-cell">
                    {firstExample && (
                      <div className="example-preview">
                        <div className="example-japanese">{firstExample.japanese}</div>
                        <div className="example-vietnamese">{firstExample.vietnamese}</div>
                      </div>
                    )}
                  </td>
                  <td className="detail-cell">
                    <Button
                      variant="secondary"
                      onClick={() => toggleExpand(point.id)}
                    >
                      {isExpanded ? t.grammar.collapse : t.grammar.viewDetails}
                    </Button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="grammar-detail-row">
                    <td colSpan={4} className="detail-content">
                      <div className="grammar-detail">
                        <div className="detail-section">
                          <h4>{t.grammar.explanation}:</h4>
                          <p>{point.description}</p>
                        </div>
                        {point.examples.length > 0 && (
                          <div className="detail-section">
                            <h4>{t.grammar.examples}:</h4>
                            <ul className="example-list">
                              {point.examples.map((example, idx) => (
                                <li key={idx} className="example-item">
                                  <div className="example-japanese">{example.japanese}</div>
                                  <div className="example-romaji">{example.romaji}</div>
                                  <div className="example-vietnamese">{example.vietnamese}</div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {point.notes && point.notes.length > 0 && (
                          <div className="detail-section">
                            <h4>{t.grammar.notes}:</h4>
                            <ul className="notes-list">
                              {point.notes.map((note, idx) => (
                                <li key={idx}>{note}</li>
                              ))}
                            </ul>
                          </div>
                        )}
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
  )
}

