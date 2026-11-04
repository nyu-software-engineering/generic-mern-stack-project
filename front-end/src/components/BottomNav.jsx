import { NavLink } from 'react-router'

const tabs = [
  { to: '/', label: 'Home' },
  { to: '/map', label: 'Map' },
  { to: '/create', label: '+' },
  { to: '/friends', label: 'Friends' },
  { to: '/profile', label: 'Profile' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t bg-white">
      <ul className="mx-auto flex max-w-md justify-around py-3">
        {tabs.map((tab) => (
          <li key={tab.to}>
            <NavLink
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                isActive ? 'font-bold text-black' : 'text-gray-400'
              }
            >
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}