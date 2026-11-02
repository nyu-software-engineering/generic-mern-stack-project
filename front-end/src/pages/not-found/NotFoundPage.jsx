import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <main id="main-content" className="mx-auto w-full max-w-[52rem] px-6 py-[clamp(2rem,8vw,6rem)]">
      <p className="mb-12 inline-block border-b-4 border-accent pb-2 text-2xl leading-[normal] font-[750] tracking-[-0.04em]">StockSim</p>
      <p className="mb-3 text-xs leading-[normal] font-[650] tracking-[0.08em] text-muted uppercase">Page unavailable</p>
      <h1 tabIndex={-1} className="max-w-[13ch] text-[clamp(2.75rem,9vw,5rem)] leading-[1.05] font-semibold tracking-[-0.055em] text-balance">
        Let’s get you back.
      </h1>
      <p className="mt-5 mb-8 max-w-[42ch] text-lg leading-[1.7] text-muted">We couldn’t find this page. Head to your portfolio to keep exploring.</p>
      <Link className="inline-flex min-h-11 items-center font-[650] underline underline-offset-[0.3em]" to="/portfolio">Go to portfolio →</Link>
    </main>
  )
}

export default NotFoundPage
