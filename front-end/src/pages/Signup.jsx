import { useState } from "react";
import Header from "../components/Header";
import TextField from "../components/TextField";

export default function SignUp(props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSignUp(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    props.onSignUp();
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
            <button type="submit" className="btn primary">
              Sign Up
            </button>
          </form>
          
          <p className="switch-text">
            Already have an account?{" "}
            <button className="link" onClick={props.goLogin}>
              Login
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