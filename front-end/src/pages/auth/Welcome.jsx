
import { Link } from 'react-router-dom'

function Welcome() {
  return (
    <main className="auth-page">
      <h2>Welcome</h2>
      <h1>DormShare</h1>
      <p>Borrow, lend and rent within NYU.</p>

      <img
        src="https://picsum.photos/seed/dormshare/600/300"
        alt="Campus community"
        width="360"
      />

      <nav aria-label="Account">
        <Link to="/signup">Create an account</Link>
        <Link to="/login">Sign in</Link>
      </nav>
    </main>
  )
}

export default Welcome
