import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import CreateHousehold from './pages/create_household/CreateHousehold'
import Protocols from './pages/protocols/Protocols'
import Templogin from './pages/temp_home'
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
// import { Link } from "react-router-dom"
import './App.css'


function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        {/* <Route basename={import.meta.env.BASE_URL} /> */}
        <Route path="/" element={<Templogin />} />
        <Route path="/create" element={<CreateHousehold />} />
        <Route path="/protocols" element={<Protocols />} />
    </Routes>
    </Router>
    
  );
}

export default App
