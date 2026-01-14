import './ProgressBar.css'

interface ProgressBarProps {
  current: number
  total: number
  className?: string
}

export default function ProgressBar({ current, total, className = '' }: ProgressBarProps) {
  const progress = (current / total) * 100

  return (
    <div className={className}>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="progress-text">
        {current} / {total}
      </p>
    </div>
  )
}

