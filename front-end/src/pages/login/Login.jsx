import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SplitLeaseLogo from "../../assets/splitlease-blank-background-logo.png";
import { login, saveCurrentUser } from "./authApi";
import "./Login.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      newErrors.email = "Enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    let user = null;
    try {
      user = await login(email, password);
    } catch {
      setLoading(false);
      setAuthError("Could not reach the server. Please try again.");
      return;
    }
    setLoading(false);

    if (!user) {
      setAuthError("Incorrect email or password. Please try again.");
      return;
    }

    saveCurrentUser(user);
    navigate("/home");
  };

  return (
    <div className="loginContainer">
      <img src={SplitLeaseLogo} alt="SplitLease logo" className="loginLogo" />

      <form className="loginCard" onSubmit={handleSubmit} noValidate>
        <h1 className="loginTitle">Welcome Back</h1>
        <p className="loginSubtitle">Log in to see your households</p>

        {authError && (
          <div className="loginAlert" role="alert">
            {authError}
          </div>
        )}

        <label className="loginLabel" htmlFor="loginEmail">
          Email
        </label>
        <input
          id="loginEmail"
          type="email"
          className={errors.email ? "loginInput loginInputError" : "loginInput"}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        {errors.email && <p className="loginFieldError">{errors.email}</p>}

        <label className="loginLabel" htmlFor="loginPassword">
          Password
        </label>
        <input
          id="loginPassword"
          type="password"
          className={
            errors.password ? "loginInput loginInputError" : "loginInput"
          }
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {errors.password && (
          <p className="loginFieldError">{errors.password}</p>
        )}

        <button className="loginButton" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="loginRegisterPrompt">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="loginRegisterLink">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
