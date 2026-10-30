import { useState } from "react";

export default function Login({ onLogin, goSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email });
  };

  return (
    <div className="page">
      <header className="header">
        <h1>Sublet Search</h1>
      </header>
      <main className="main-content">
        <div className="card">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="btn primary">
              Login
            </button>
          </form>

          <p className="switch-text">
            Don't have an account?{" "}
            <button type="button" className="link" onClick={goSignUp}>
              Sign Up
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}