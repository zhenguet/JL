interface EmptyMessageProps {
  message: string
  className?: string
}

export default function EmptyMessage({ message, className = '' }: EmptyMessageProps) {
  return (
    <p className={`empty-message ${className}`}>
      {message}
    </p>
  )
}

