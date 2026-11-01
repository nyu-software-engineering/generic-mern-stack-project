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
          <div className="welcome-illustration" aria-hidden="true">
            <div className="welcome-circle welcome-circle-one"></div>
            <div className="welcome-circle welcome-circle-two"></div>
            <span className="welcome-illustration-text">DOIN</span>
          </div>

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
