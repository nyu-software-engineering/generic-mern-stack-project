
import { useState } from "react";
import "./App.css";

function App() {
  const [isRegister, setIsRegister] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    alert("This is a frontend demo. No account was created.");
  }

  return (
    <div className="page">
      <div className="form-box">
        <h1>MapMaker</h1>

        <h2>{isRegister ? "Create an Account" : "Sign In"}</h2>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div>
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                required
              />
            </div>
          )}

          <div>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit">
            {isRegister ? "Register" : "Sign In"}
          </button>
        </form>

        <p>
          {isRegister
            ? "Already have an account?"
            : "Don't have an account?"}
        </p>

        <button
          className="switch-button"
          type="button"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? "Sign In" : "Register"}
        </button>
      </div>
    </div>
  );
}

export default App;
