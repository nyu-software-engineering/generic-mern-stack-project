import { useState } from "react";
import { Link } from "react-router-dom";
import "./CreateAccount.css";

function CreateAccount() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill out all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Account creation will be connected to the backend later.
    setError("Account creation is not available yet. Please try again later.");
  };

  return (
    <main className="create-account-page">
      <div className="create-account-container">
        <div className="create-account-header">
          <h1>Create Account</h1>
          <p>
            Join HobbyHub and connect with people who share your interests.
          </p>
        </div>

        <form className="create-account-form" onSubmit={handleSubmit}>
          <div className="create-account-field">
            <label htmlFor="signup-name">Full Name</label>
            <input
              id="signup-name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="create-account-field">
            <label htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="create-account-field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div className="create-account-field">
            <label htmlFor="signup-confirm-password">
              Confirm Password
            </label>
            <input
              id="signup-confirm-password"
              type="password"
              placeholder="Confirm your password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>

          {error && (
            <p className="create-account-error" role="alert">
              {error}
            </p>
          )}

          <button className="create-account-button" type="submit">
            Create Account
          </button>
        </form>

        <p className="create-account-login">
          Already have an account?{" "}
          <Link to="/login">Log In</Link>
        </p>
      </div>
    </main>
  );
}

export default CreateAccount;
