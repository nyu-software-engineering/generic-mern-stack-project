import { BookOpen, BriefcaseBusiness, ChartColumnIncreasing, ChartNoAxesCombined, UserRound } from 'lucide-react'
import { NavLink } from 'react-router'

const destinations = [
  { to: '/portfolio', label: 'Portfolio', icon: BriefcaseBusiness },
  { to: '/market', label: 'Market', icon: ChartNoAxesCombined },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/leaderboard', label: 'Ranks', icon: ChartColumnIncreasing },
  { to: '/account', label: 'Account', icon: UserRound },
]

function BottomNavigation() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface pt-2 pr-[max(0.5rem,env(safe-area-inset-right))] pb-[calc(0.5rem+env(safe-area-inset-bottom))] pl-[max(0.5rem,env(safe-area-inset-left))]"
      aria-label="Main navigation"
    >
      <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1">
        {destinations.map(({ to, label, icon: Icon }) => (
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
            <Icon size={24} strokeWidth={1.7} aria-hidden="true" focusable="false" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNavigation
