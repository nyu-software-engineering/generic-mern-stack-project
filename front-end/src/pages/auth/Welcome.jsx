
import { Link } from 'react-router-dom'
import '../../styles/accounts.css'
import './welcome.css'

function Welcome() {
  return (
    <main className="ds-page ds-account ds-welcome">
      <div className="ds-welcome-intro">
        <h1 className="ds-heading">Borrow, lend and rent within NYU.</h1>
        <p>Find everyday items for a short time, or offer something you own.</p>
        <p className="ds-account-help">Browse items, agree on rental terms, and arrange pickup and return with another student.</p>
      </div>
      <section className="ds-account-surface" aria-labelledby="welcome-account-heading">
        <h2 id="welcome-account-heading">Get started</h2>
        <p>Join DormShare or return to your profile.</p>
        <nav className="ds-welcome-actions" aria-label="Account">
          <Link className="ds-button ds-button--primary" to="/signup">Create an account</Link>
          <Link className="ds-button ds-button--secondary" to="/login">Sign in</Link>
        </nav>
        <p className="ds-account-help ds-welcome-note">Demo account access. Account changes reset when you reload.</p>
      </section>
    </main>
  )
}

export default Welcome
