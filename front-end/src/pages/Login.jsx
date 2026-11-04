import { useState } from "react";
import { Link, useNavigate } from "react-router";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [resetMessage, setResetMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const newErrors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Please enter your password.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Sprint 1: mock login, without backend authentication.
      navigate("/discover");
    }
  }

  function handleForgotPassword() {
    setResetMessage(
      "Password reset will be available when account services are connected.",
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        <header className="auth-header">
          <h1>Welcome back</h1>
        </header>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="auth-field">
            <label htmlFor="login-email">Email</label>
            <input
              className="doin-input"
              id="login-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
            />

            {errors.email && (
              <p className="auth-error" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <input
              className="doin-input"
              id="login-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              aria-invalid={Boolean(errors.password)}
            />

            {errors.password && (
              <p className="auth-error" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <div className="auth-forgot">
            <button type="button" onClick={handleForgotPassword}>
              Forgot password?
            </button>
          </div>

          {resetMessage && (
            <p className="auth-notice" role="status">
              {resetMessage}
            </p>
          )}

          <div className="auth-actions">
            <button
              type="submit"
              className="doin-button doin-button--primary auth-primary-button"
            >
              Log in
            </button>

            <p className="auth-switch">
              New to Doin? <Link to="/register">Create an account</Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
