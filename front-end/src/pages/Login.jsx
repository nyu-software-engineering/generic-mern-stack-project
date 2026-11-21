import { useState } from "react";
import Header from "../components/Header";
import TextField from "../components/TextField";
import {useNavigate} from "react-router-dom";
import "./Login.css"

export default function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    setError(data.error || "Login failed.");
    return;
  }

  localStorage.setItem("user", JSON.stringify(data));
    if (props.onLogin) {
      props.onLogin(data);
    }
    navigate("/app/explore");
  }

  return (
    <div>
      <Header />
      <div className="page">
        <div className="card">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
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
            <button type="submit" className="btn primary">
              Login
            </button>
          </form>

          <p className="switch-text">
            Don't have an account?{" "}
            <button className="link" onClick={() => navigate("/signUp")}>
              Sign Up
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