export function generateLessonStaticParams(maxLesson: number = 116) {
  return Array.from({ length: maxLesson }, (_, i) => ({
    lessonNumber: String(i + 1),
  }))
}
