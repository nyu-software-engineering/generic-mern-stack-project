import { Link } from 'react-router-dom'

export default function PageHeader({ title, backTo }) {
  return (
    <header className="flex items-center gap-2 px-4 pt-6 pb-4">
      {backTo && (
        <Link
          to={backTo}
          aria-label="Back"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-stone-700 hover:bg-stone-100"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      )}
      <h1 className="text-xl font-semibold text-stone-900">{title}</h1>
    </header>
  )
}
