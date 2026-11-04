import { useNavigate } from 'react-router'

// Simple back link shown at the top of sub-pages, matching the wireframes.
function BackLink() {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="mb-6 inline-flex min-h-11 cursor-pointer items-center border-none bg-transparent p-0 font-[650] text-ink underline underline-offset-[0.3em]"
    >
      Back
    </button>
  )
}

export default BackLink
