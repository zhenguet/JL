import UsagePageClient from './UsagePageClient'

export function generateStaticParams() {
  return Array.from({ length: 50 }, (_, i) => ({
    lessonNumber: String(i + 1),
  }))
}

interface PageProps {
  params: {
    lessonNumber: string
  }
}

export default function UsagePage({ params }: PageProps) {
  const lessonNumber = parseInt(params.lessonNumber, 10)
  return <UsagePageClient lessonNumber={lessonNumber} />
}

