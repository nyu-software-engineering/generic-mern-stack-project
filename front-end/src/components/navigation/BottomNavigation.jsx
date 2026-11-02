import { NavLink } from 'react-router'

const destinations = [
  { to: '/portfolio', label: 'Portfolio', icon: 'portfolio' },
  { to: '/market', label: 'Market', icon: 'market' },
  { to: '/learn', label: 'Learn', icon: 'learn' },
  { to: '/leaderboard', label: 'Ranks', icon: 'ranks' },
  { to: '/account', label: 'Account', icon: 'account' },
]

const iconPaths = {
  portfolio: <><rect x="3" y="7" width="18" height="14" rx="3" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v3h4v-3" /></>,
  market: <><path d="M3 3v18h18M7 15l4-5 4 3 6-8M17 5h4v4" /></>,
  learn: <><path d="M12 5C9 3 6 3 3 4v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1ZM12 5v15" /></>,
  ranks: <><path d="M9 21H3v-7h6M9 21V8h6v13M15 21h6V11h-6M9 4h6" /></>,
  account: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
}

function BottomNavigation() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface pt-2 pr-[max(0.5rem,env(safe-area-inset-right))] pb-[calc(0.5rem+env(safe-area-inset-bottom))] pl-[max(0.5rem,env(safe-area-inset-left))]"
      aria-label="Main navigation"
    >
      <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1">
        {destinations.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-[0.875rem] px-0.5 py-2 text-[0.6875rem] no-underline ${
                isActive
                  ? 'bg-selected font-[750] text-selected-ink'
                  : 'font-[550] text-muted hover:bg-hover hover:text-ink'
              }`
            }
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              {iconPaths[icon]}
            </svg>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNavigation
