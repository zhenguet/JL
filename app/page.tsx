import Link from 'next/link'
import './home.css'

export default function HomePage() {
  const lessons = Array.from({ length: 50 }, (_, i) => i + 1)

  return (
    <div className="home-page">
      <div className="home-container">
        <h1>Minna no Nihongo</h1>
        <p className="subtitle">Chọn bài học để bắt đầu</p>
        <div className="lessons-grid">
          {lessons.map((lesson) => (
            <Link
              key={lesson}
              href={`/lesson/${lesson}/vocabulary`}
              className="lesson-card"
            >
              Bài {lesson}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

