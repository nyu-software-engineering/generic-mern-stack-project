import { useEffect, useState } from 'react'
import './App.css'
import MyMaps from "./MyMaps";
import MapEditor from "./Map-Editor";
import Home from "./Home";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

const sampleMaps = [1, 2, 3].map((number) => ({ number, name: "Map Title", image: "https://picsum.photos/100/100" }));

function App() {
  const [isRegister, setIsRegister] = useState(false);
  const [maps, setMaps] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mapmaker-maps'))
      return Array.isArray(saved)
        ? saved.map((map) => ({ ...map, image: map.image || 'https://picsum.photos/100/100' }))
        : sampleMaps
    }
    catch { return sampleMaps }
  });

  useEffect(() => {
    try { localStorage.setItem('mapmaker-maps', JSON.stringify(maps)) }
    catch {}
  }, [maps]);

  function createMap(name) {
    const map = { number: Date.now(), name: name.trim() || 'Untitled Map', image: 'https://picsum.photos/400/400' };
    setMaps((existing) => [map, ...existing]);
    return map;
  }

  function renameMap(number, name) {
    setMaps((existing) => existing.map((map) => map.number === number ? { ...map, name } : map));
  }

  function handleSubmit(event) {
    event.preventDefault();
    alert("This is a frontend demo. No account was created.");
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
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
        <p><Link to="/">Back to Home</Link></p>
      </div>
    </div>

     } />

        <Route path="/" element={<Home onCreateMap={createMap} />} />
        <Route path="/home" element={<Home onCreateMap={createMap} />} />
        <Route path="/menu" element={
          <main className="menu-page">
            <header><h2><Link to="/">Logo</Link></h2></header>
            <h1>Menu</h1>
            <nav aria-label="Main menu">
              <p><Link to="/">Home</Link></p>
              <p><Link to="/MyMaps">My Maps</Link></p>
              <p><Link to="/login">Sign in / Sign up</Link></p>
            </nav>
          </main>
        } />
        <Route path="/MyMaps" element={<MyMaps maps={maps} onCreateMap={createMap} />} />
        <Route path="/Map-Editor" element={<MapEditor onRenameMap={renameMap} />} />

      </Routes>
    </Router>
  );
}

export default App;
