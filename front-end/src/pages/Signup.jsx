import { useState } from "react";
import Header from "../components/Header";
import TextField from "../components/TextField";

export default function SignUp({ onSignUp, goLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (password !== confirm) {
      setError("Passwords don't match. Re-enter them and try again.");
      return;
    }
    setError("");
    onSignUp({ name, email });
  };

  return (
    <>
      <Header />
      <div className="page">
        <div className="card">
          <h2>Sign Up</h2>
          <TextField label="Name" placeholder="Enter your name" value={name} onChange={setName} autoComplete="name" />
          <TextField label="Email" type="email" placeholder="Enter your email" value={email} onChange={setEmail} autoComplete="email" />
          <TextField label="Password" type="password" placeholder="Create a password" value={password} onChange={setPassword} autoComplete="new-password" />
          <TextField label="Confirm password" type="password" placeholder="Re-enter your password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn primary" onClick={handleSubmit}>Sign Up</button>
          <p className="switch-text">
            Already have an account?{" "}
            <button className="link" onClick={goLogin}>Login</button>
          </p>
        </div>
      </div>
    </>
  );
}