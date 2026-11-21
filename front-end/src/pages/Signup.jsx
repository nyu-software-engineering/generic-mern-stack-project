import { useState } from "react";
import Header from "../components/Header";
import TextField from "../components/TextField";
import {useNavigate} from "react-router-dom";

export default function SignUp(props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSignUp(e) {
    e.preventDefault();
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Sign up failed.");
      return;
    }

    localStorage.setItem("user", JSON.stringify(data));
    if (props.onSignUp) {
      props.onSignUp(data);
    }
    navigate("/app/explore");
  }

  return (
    <div>
      <Header />
      <div className="page">
        <div className="card">
          <h2>Sign Up</h2>
          <form onSubmit={handleSignUp}>
            <TextField 
              label="Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
            <TextField 
              label="Email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <TextField 
              label="Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <TextField 
              label="Confirm Password" 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
            {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
            <button type="submit" className="btn primary">
              Sign Up
            </button>
          </form>
          
          <p className="switch-text">
            Already have an account?{" "}
            <button className="link" onClick={() => navigate("/")}>
              Login
            </button>
          </p>

          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <button className="btn secondary" onClick={() => navigate("/app/explore")}>
              Continue as a Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
