import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import VocabularyPageClient from './VocabularyPageClient'

export function generateStaticParams() {
  const lessonDir = path.join(process.cwd(), 'data', 'lesson')
  const files = fs.readdirSync(lessonDir)
  const lessonNumbers = files
    .filter((file) => file.startsWith('lesson') && file.endsWith('.json'))
    .map((file) => {
      const match = file.match(/lesson(\d+)\.json/)
      return match ? parseInt(match[1], 10) : null
    })
    .filter((num): num is number => num !== null)
    .sort((a, b) => a - b)

  return lessonNumbers.map((num) => ({
    lessonNumber: String(num),
  }))
}

interface PageProps {
  params: {
    lessonNumber: string
  }
}

export default function VocabularyPage({ params }: PageProps) {
  const lessonNumber = parseInt(params.lessonNumber, 10)

  const lessonFile = path.join(
    process.cwd(),
    'data',
    'lesson',
    `lesson${lessonNumber}.json`
  )

  if (!fs.existsSync(lessonFile)) {
    notFound()
  }

  return <VocabularyPageClient lessonNumber={lessonNumber} />
}

