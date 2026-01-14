export function generateLessonStaticParams(maxLesson: number = 74) {
  return Array.from({ length: maxLesson }, (_, i) => ({
    lessonNumber: String(i + 1),
  }))
}
