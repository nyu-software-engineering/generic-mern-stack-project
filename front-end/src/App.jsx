import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import MyMaps from "./MyMaps";
import MapEditor from "./Map-Editor";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'




function App() {
  const [isRegister, setIsRegister] = useState(false);
  const [count, setCount] = useState(0)

  function handleSubmit(event) {
    event.preventDefault();
    alert("This is a frontend demo. No account was created.");
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
    
    <div className="page">
      <div className="form-box">
        <h1>MapMaker</h1>

        <p className="tagline">
          Create, customize, and share your maps.
        </p>

        <h2>{isRegister ? "Create an Account" : "Welcome Back!"}</h2>

        <p className="description">
          {isRegister
            ? "Get started by creating your account."
            : "Sign in to continue creating maps."}
        </p>

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

     } />

        <Route path="/MyMaps" element={<MyMaps />} />
        <Route path="/Map-Editor" element={<MapEditor />} />

      </Routes>
    </Router>

    
  );
}

export default App;
