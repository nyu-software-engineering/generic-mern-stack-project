
import { Link } from 'react-router-dom'
import './welcome.css'

function Welcome() {
  return (
    <main className="welcome-screen">
      <h2>Welcome</h2>

      <h1>DormShare</h1>
      <p>Borrow, lend and rent within NYU.</p>

      <div className="welcome-image-placeholder" aria-hidden="true">
        Campus sharing image
      </div>

      <nav className="welcome-actions" aria-label="Account">
        <Link className="welcome-button welcome-primary" to="/signup">
          Create an account
        </Link>

        <Link className="welcome-button welcome-secondary" to="/login">
          Sign in
        </Link>
      </nav>
    </main>
  )
}

export default Welcome
