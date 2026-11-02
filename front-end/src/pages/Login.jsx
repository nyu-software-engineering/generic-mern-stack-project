import { useState } from "react";
import Header from "../components/Header";
import TextField from "../components/TextField";

export default function Login({ onLogin, goSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    onLogin({ email });
  };

  return (
    <>
      <Header />
      <div className="page">
        <div className="card">
          <h2>Login</h2>
          <TextField label="Email" type="email" placeholder="Enter your email" value={email} onChange={setEmail} autoComplete="email" />
          <TextField label="Password" type="password" placeholder="Enter your password" value={password} onChange={setPassword} autoComplete="current-password" />
          <button className="btn primary" onClick={handleSubmit}>Login</button>
          <p className="switch-text">
            Don't have an account?{" "}
            <button className="link" onClick={goSignUp}>Sign Up</button>
          </p>
        </div>
      </div>
    </>
  );
}