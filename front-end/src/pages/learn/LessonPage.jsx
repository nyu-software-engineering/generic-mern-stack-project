import { Link, useParams } from 'react-router'
import { lessons } from '../../services/mockData.js'

function LessonPage() {
  const { lessonId } = useParams()
  const lessonIndex = lessons.findIndex((item) => item.id === lessonId)
  const lesson = lessons[lessonIndex]

  if (!lesson) {
    return (
      <>
        <Link
          to="/learn"
          className="mb-6 inline-flex min-h-11 items-center font-[650] text-ink underline underline-offset-[0.3em]"
        >
          Back
        </Link>
        <h1 tabIndex={-1} className="text-3xl font-semibold tracking-[-0.04em]">
          Lesson not found
        </h1>
      </>
    )
  }

  const lessonNumber = lessonIndex + 1
  const previousLesson = lessonIndex > 0 ? lessons[lessonIndex - 1] : null
  const nextLesson = lessonIndex < lessons.length - 1 ? lessons[lessonIndex + 1] : null

  return (
    <>
      <Link
        to="/learn"
        className="mb-6 inline-flex min-h-11 items-center font-[650] text-ink underline underline-offset-[0.3em]"
      >
        Back
      </Link>
      <p className="text-sm font-[650] tracking-[0.08em] text-muted uppercase">
        Lesson {lessonNumber} of {lessons.length} | {lesson.duration}
      </p>
      <h1 tabIndex={-1} className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
        {lesson.title}
      </h1>

      <img
        src={lesson.imageUrl}
        alt={lesson.imageAlt}
        className="mt-6 w-full rounded-2xl border border-border object-cover"
      />

      <p className="mt-6 text-lg leading-[1.7] text-muted">{lesson.content}</p>

      <div className="mt-8 flex flex-col gap-3">
        {previousLesson && (
          <Link
            to={`/learn/${previousLesson.id}`}
            className="inline-flex min-h-12 items-center justify-center rounded-[2rem] border border-border px-6 py-3.5 font-[650] text-ink no-underline hover:bg-hover"
          >
            Previous: {previousLesson.title}
          </Link>
        )}
        {nextLesson && (
          <Link
            to={`/learn/${nextLesson.id}`}
            className="inline-flex min-h-12 items-center justify-center rounded-[2rem] border border-border px-6 py-3.5 font-[650] text-ink no-underline hover:bg-hover"
          >
            Next: {nextLesson.title}
          </Link>
        )}
      </div>
    </>
  )
}

export default LessonPage
