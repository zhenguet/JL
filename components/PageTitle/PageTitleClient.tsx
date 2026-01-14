'use client'

import { useI18n } from '@/i18n/context'
import './PageTitle.css'

interface PageTitleClientProps {
  title: string
  lessonNumber: number
  count?: number
  countLabel?: string
  className?: string
}

export default function PageTitleClient({
  title,
  lessonNumber,
  count,
  countLabel,
  className = '',
}: PageTitleClientProps) {
  const { t } = useI18n()
  return (
    <div className={`page-title ${className}`}>
      <h2>{title}</h2>
      {count !== undefined && countLabel && (
        <p className="count-text">{t.common.total}: {count} {countLabel}</p>
      )}
    </div>
  )
}
