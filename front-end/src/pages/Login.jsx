import { useState } from "react";
import Header from "../components/Header";
import TextField from "../components/TextField";

export default function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    props.onLogin();
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
            <button className="link" onClick={props.goSignUp}>
              Sign Up
            </button>
          </p>

          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <button className="btn secondary" onClick={props.onGuest}>
              Continue as a Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}