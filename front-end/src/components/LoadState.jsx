import Button from './Button.jsx'

export function LoadingState({ message = 'Loading…' }) {
  return (
    <p role="status" className="px-5 py-10 text-center text-sm text-muted">
      {message}
    </p>
  )
}

// pass in error.message and retry from useApi
export function ErrorState({ message = "Couldn't load this.", onRetry }) {
  return (
    <div role="alert" className="px-5 py-10 text-center">
      <p className="text-sm text-ink">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}