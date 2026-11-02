
import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function Navbar() {
  const { currentUser, signOut } = useContext(AuthContext)
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  return (
    <header>
      <nav aria-label="Main navigation">
        <Link to="/">DormShare</Link>

        {currentUser && (
          <button type="button" onClick={handleSignOut}>
            Sign out
          </button>
        )}
      </nav>
    </header>
  )
}

export default Navbar
