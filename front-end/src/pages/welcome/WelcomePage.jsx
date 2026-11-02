import { Link } from 'react-router'

function WelcomePage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-[52rem] px-6 py-[clamp(2rem,8vw,6rem)]">
      <p className="mb-12 inline-block border-b-4 border-accent pb-2 text-2xl leading-[normal] font-[750] tracking-[-0.04em]">StockSim</p>
      <h1 tabIndex={-1} className="max-w-[13ch] text-[clamp(2.75rem,9vw,5rem)] leading-[1.05] font-semibold tracking-[-0.055em] text-balance">
        Build your investing confidence.
      </h1>
      <p className="mt-6 max-w-[36ch] text-lg leading-[1.6] text-muted">
        Practice investing with virtual money and learn as you go.
      </p>
      <nav className="mt-10 flex max-w-sm flex-col gap-3" aria-label="Get started">
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-[2rem] bg-accent px-6 py-3.5 font-[650] text-ink no-underline hover:bg-accent-hover"
          to="/create-account"
        >
          Create account
        </Link>
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-[2rem] border border-border px-6 py-3.5 font-[650] text-ink no-underline hover:bg-hover"
          to="/login"
        >
          Log in
        </Link>
      </nav>
    </main>
  )
}

export default WelcomePage
