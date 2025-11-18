import './PageTitle.css'

interface PageTitleProps {
  title: string
  lessonNumber: number
  count?: number
  countLabel?: string
  className?: string
}

export default function PageTitle({
  title,
  lessonNumber,
  count,
  countLabel,
  className = '',
}: PageTitleProps) {
  return (
    <div className={`page-title ${className}`}>
      <h2>{title} Bài {lessonNumber}</h2>
      {count !== undefined && countLabel && (
        <p className="count-text">Tổng cộng: {count} {countLabel}</p>
      )}
    </div>
  )
}

