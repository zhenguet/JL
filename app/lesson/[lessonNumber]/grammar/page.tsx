import GrammarClient from './GrammarClient'

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

export default function GrammarPage({ params }: PageProps) {
  const lessonNumber = parseInt(params.lessonNumber, 10)
  return <GrammarClient lessonNumber={lessonNumber} />
}

