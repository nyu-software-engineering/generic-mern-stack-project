import { Link } from 'react-router'
import PageIntro from '../../components/layout/PageIntro.jsx'
import { lessons } from '../../services/mockData.js'

function LearnPage() {
  return (
    <>
      <PageIntro
        eyebrow="Practice account"
        title="Learn"
        description="Learn about investing with short lessons."
      />

      <section aria-label="Lessons">
        <h2 className="text-xl font-semibold tracking-[-0.03em]">Lessons</h2>

        <ul className="mt-4 flex flex-col gap-3">
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <Link
                to={`/learn/${lesson.id}`}
                className="block rounded-2xl border border-border p-5 text-ink no-underline hover:bg-hover"
              >
                <p className="font-[650]">{lesson.title}</p>
                <p className="mt-1 text-sm text-muted">{lesson.description}</p>
                <p className="mt-2 text-sm text-muted">{lesson.duration}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Link
        to="/learn/glossary"
        className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-[2rem] border border-border px-6 py-3.5 font-[650] text-ink no-underline hover:bg-hover"
      >
        Glossary
      </Link>
    </>
  )
}

export default LearnPage
