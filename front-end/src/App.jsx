import { useState } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import Bookings from './pages/Bookings.jsx'
import Profile from './pages/Profile.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import './App.css'

function App() {
  const [user, setUser] = useState(null)

  //not logged in
  if(!user){
    return (
      <main className="page">
        <Routes>
          <Route path="/login" element={<Login onLogin={setUser} />} />

          <Route path="/register" element={<Register />} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    )
  }
  //user is logged in
  else{
    return (
      <div className="app">

        <header className="top-bar">
          <strong>CampusMart</strong>
          <button type="button" onClick={() => setUser(null)}>
            Log Out
          </button>
        </header>


        <main className="page">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/profile" element={<Profile />} />

            <Route path="/login" element={<Navigate to="/" replace />}/>
            <Route path="/register" element={<Navigate to="/" replace />}/>
            <Route path="*" element={<h1>Page not found</h1>}/>
          </Routes>
        </main>

        <nav className="tab-bar" aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/search">
            Search
          </NavLink>

          <NavLink to="/bookings">
            Bookings
          </NavLink>

          <NavLink to="/profile">
            Profile
          </NavLink>
        </nav>
      </div>
    )
  }
}

export default App
