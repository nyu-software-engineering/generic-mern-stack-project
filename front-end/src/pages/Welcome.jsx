import { Link } from "react-router";
import "./Welcome.css";

export default function Welcome() {
  return (
    <main className="welcome-page">
      <div className="welcome-container">
        <header className="welcome-header">
          <span className="welcome-logo">doin</span>
        </header>

        <section className="welcome-content">
          <img
            src="/doin-illustration.svg"
            alt="Friends spending time together"
            className="welcome-illustration"
          />

          <h1>Meet people. Do things together.</h1>
          <p>Discover people and events nearby.</p>
        </section>

        <nav className="welcome-actions" aria-label="Account navigation">
          <Link to="/register" className="welcome-button welcome-primary">
            Create account
          </Link>

          <Link to="/login" className="welcome-button welcome-secondary">
            Login
          </Link>
        </nav>
      </div>
    </main>
  );
}
