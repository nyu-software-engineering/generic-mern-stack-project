import { NavLink } from 'react-router-dom'

const TABS = [
  {
    to: '/closet',
    label: 'Closet',
    icon: <path d="M16 3l5 3-2 4-3-1v12H8V9l-3 1-2-4 5-3a4 4 0 0 0 8 0z" />,
  },
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: <path d="M5 21V10M12 21V4M19 21v-8" />,
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
      </>
    ),
  },
]

export default function TabBar() {
  return (
    <nav
      aria-label="Main"
      className="fixed bottom-0 left-1/2 flex w-full max-w-md -translate-x-1/2 border-t border-stone-200 bg-white"
    >
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
              isActive ? 'font-bold text-stone-900' : 'text-stone-500'
            }`
          }
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {tab.icon}
          </svg>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}