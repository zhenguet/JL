import Link from 'next/link'
import './home.css'

export default function HomePage() {
  const n5Lessons = Array.from({ length: 25 }, (_, i) => i + 1)
  const n4Lessons = Array.from({ length: 25 }, (_, i) => i + 26)

  return (
    <div className="home-page">
      <div className="home-container">
        <h1>Minna no Nihongo</h1>
        <p className="subtitle">Chọn bài học để bắt đầu</p>
        
        <div className="level-section">
          <h2 className="level-title">N5</h2>
          <div className="lessons-grid">
            {n5Lessons.map((lesson) => (
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

        <div className="level-section">
          <h2 className="level-title">N4</h2>
          <div className="lessons-grid">
            {n4Lessons.map((lesson) => (
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
    </div>
  )
}

