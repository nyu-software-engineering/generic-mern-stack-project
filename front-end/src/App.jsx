import { useState } from 'react'
import { NavLink, Route, Routes } from 'react-router'
import Home from './pages/Home.jsx'
import Search from './pages/Search.jsx'
import Bookings from './pages/Bookings.jsx'
import Profile from './pages/Profile.jsx'
import './App.css'

function App() {
  return (
    <div className="app">
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<h1>Page not found</h1>} />
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

export default App
