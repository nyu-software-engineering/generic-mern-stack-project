import './Auth.css'

function Welcome() {
  return (
    <section className="auth">
      <p className="auth-logo">CareerHive</p>
      <img
        className="auth-image"
        src="https://picsum.photos/seed/careerhive-welcome/720/400"
        alt=""
      />
      <h1>Your whole job search, in one place</h1>
      <p className="auth-lead">
        Find internships, track every application, and never miss a deadline.
      </p>
      <div className="auth-actions">
        <a className="ui-button auth-link-button" href="#/signup">Sign Up</a>
        <a className="ui-button ui-button-secondary auth-link-button" href="#/login">Log In</a>
      </div>
    </section>
  )
}

export default Welcome
