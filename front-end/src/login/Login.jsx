import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    // Authentication will be connected to the backend later.
    setError("Login is not available yet. Please try again later.");
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome Back!</h1>
          <p>Log in to connect with people who share your hobbies.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button className="login-button" type="submit">
            Log In
          </button>
        </form>

        <p className="login-signup">
          Don't have an account?{" "}
          <Link to="/create-account">Create Account</Link>
        </p>
      </div>
    </main>
  );
}

export default Login;
