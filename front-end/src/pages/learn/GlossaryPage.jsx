import { Link } from 'react-router'
import { glossaryTerms } from '../../services/mockData.js'

function GlossaryPage() {
  return (
    <>
      <Link
        to="/learn"
        className="mb-6 inline-flex min-h-11 items-center font-[650] text-ink underline underline-offset-[0.3em]"
      >
        Back
      </Link>

      <h1 tabIndex={-1} className="text-4xl font-semibold tracking-[-0.04em]">
        Glossary
      </h1>
      <p className="mt-3 text-muted">Simple definitions of common investing words.</p>

      <ul className="mt-6 flex flex-col gap-3">
        {glossaryTerms.map((item) => (
          <li key={item.id} className="rounded-2xl border border-border p-5">
            <p className="font-[650]">{item.term}</p>
            <p className="mt-1 text-sm text-muted">{item.definition}</p>
          </li>
        ))}
      </ul>
    </>
  )
}

export default GlossaryPage
