import { NavLink } from "react-router-dom"

const tabs = [
  { to: "/feed", label: "Feed" },
  { to: "/discover", label: "Discover" },
  { to: "/following", label: "Following" },
  { to: "/map", label: "Map" },
  { to: "/profile", label: "Profile" },
]

const BottomNav = () => {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end
          className={({ isActive }) =>
            isActive ? "bottom-nav-item bottom-nav-active" : "bottom-nav-item"
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav