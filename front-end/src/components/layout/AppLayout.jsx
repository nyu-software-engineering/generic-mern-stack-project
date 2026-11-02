import { Link, Outlet } from 'react-router'
import BottomNavigation from '../navigation/BottomNavigation.jsx'

function AppLayout() {
  return (
    <div className="min-h-screen supports-[height:100dvh]:min-h-dvh">
      <a
        className="fixed top-2 left-4 z-30 -translate-y-[200%] rounded-lg border border-ink bg-surface px-4 py-3 focus:translate-y-0"
        href="#main-content"
      >
        Skip to content
      </a>
      <header className="border-b border-border">
        <div className="mx-auto flex min-h-20 max-w-5xl items-center justify-between gap-4 py-4 pr-[max(1.25rem,env(safe-area-inset-right))] pl-[max(1.25rem,env(safe-area-inset-left))]">
          <Link className="text-2xl leading-[normal] font-[750] tracking-[-0.04em] no-underline" to="/portfolio">StockSim</Link>
          <span className="inline-flex items-center gap-2 text-xs leading-[normal] text-muted">
            <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
            Virtual investing
          </span>
        </div>
      </header>
      <main
        id="main-content"
        className="mx-auto max-w-5xl pt-[clamp(2.5rem,7vw,5rem)] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[calc(8rem+env(safe-area-inset-bottom))] pl-[max(1.25rem,env(safe-area-inset-left))]"
        tabIndex={-1}
      >
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  )
}

export default AppLayout
