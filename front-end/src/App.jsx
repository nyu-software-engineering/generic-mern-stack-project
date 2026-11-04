import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import CreateHousehold from './pages/create_household/CreateHousehold'
import MonthlyActivity from './pages/monthly_activity/MonthlyActivity'
import Templogin from './pages/temp_home'
import Temphome from "./pages/temp_home";
import React from "react";
import Register from "./pages/register/register";
import AssetList from "./pages/assets/AssetList";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { Link } from "react-router-dom"
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Routes>
        {/* <Route basename={import.meta.env.BASE_URL} /> */}
        <Route path="/" element={<Temphome />} />
        <Route path="/create" element={<CreateHousehold />} />
        <Route path="/monthly-activity" element={<MonthlyActivity />} />
        <Route path="/register" element={<Register />} />
        <Route path="/assets" element={<AssetList />} />
      </Routes>
    </Router>
  );
}

export default App;
