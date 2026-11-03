
import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { currentUser, signOut } = useContext(AuthContext)
  const navigate = useNavigate()

  const links = [
  { name: "Browse", path: "/browse" },
  { name: "Requests", path: "/requests-board" },
  { name: "List", path: "/listings/new" },
  { name: "Messages", path: "/inbox" },
  { name: "Profile", path: "/profile" },
];

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  return (
    <header className="ds-navbar">
      <nav className="ds-navbar-inner" aria-label="Main navigation">
        <Link
          to={currentUser ? "/browse" : "/"}
          className="ds-navbar-brand"
        >
          DormShare
        </Link>


        {currentUser && (
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-black"
                  : "text-gray-500 hover:text-black"
              }
            >
              {link.name}
            </Link>
          ))}
      
          <button
            type="button"
            className="ds-navbar-signout"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar
