import { Link } from 'react-router'

// The app's standard back button: a round white button with an arrow.
// `label` is what screen readers announce, e.g. "Back to Paris".
// Pass className to position it (PlaceDetail floats it over the photo).
export default function BackLink({ to, label = 'Back', className = '' }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={`flex size-10 items-center justify-center rounded-pill border border-border bg-surface text-lg shadow-button hover:bg-subtle focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand ${className}`}
    >
      <span aria-hidden="true">←</span>
    </Link>
  )
}