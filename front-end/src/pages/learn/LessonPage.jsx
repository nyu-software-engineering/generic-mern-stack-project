import { useParams } from 'react-router'
import BackLink from '../../components/ui/BackLink.jsx'
import { lessons } from '../../services/mockData.js'

function LessonPage() {
  const { lessonId } = useParams()
  const lesson = lessons.find((item) => item.id === lessonId)

  if (!lesson) {
    return (
      <>
        <BackLink />
        <h1 tabIndex={-1} className="text-3xl font-semibold tracking-[-0.04em]">
          Lesson not found
        </h1>
      </>
    )
  }

  const lessonNumber = lessons.findIndex((item) => item.id === lessonId) + 1

  return (
    <>
      <BackLink />
      <p className="text-sm font-[650] tracking-[0.08em] text-muted uppercase">
        Lesson {lessonNumber} of {lessons.length} | {lesson.duration}
      </p>
      <h1 tabIndex={-1} className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
        {lesson.title}
      </h1>
      <p className="mt-6 text-lg leading-[1.7] text-muted">{lesson.content}</p>
    </>
  )
}

export default LessonPage
