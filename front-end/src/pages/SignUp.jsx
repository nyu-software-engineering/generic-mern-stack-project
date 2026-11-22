
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Sign.css";

function SignUp() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Demo account validation
    if (
      email.trim() !== "test@hotelplanner.com" ||
      password !== "password123"
    ) {
      setError("Please use the demo account to sign up.");
      return;
    }

    // Demo signup successful
    navigate("/signin");
  };

  return (
    <div className="sign-up">
      <h2>Sign Up</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-email">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-password">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit">Sign Up</button>

        <p>
          Already have an account?{" "}
          <Link to="/signin">Sign In</Link>
        </p>
      </form>
    </div>
  );
}

export default SignUp;

