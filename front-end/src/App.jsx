import { useState } from "react";
import CreateHousehold from "./pages/create_household/CreateHousehold";
import Login from "./pages/login/Login";
import Temphome from "./pages/temp_home";
import IndividualProtocol from "./pages/individual_protocol/individual_protocol";
import Protocols from "./pages/protocols/Protocols";
import React from "react";
import Register from "./pages/register/register";
import AssetList from "./pages/assets/AssetList";
import MonthlyActivity from "./pages/monthly_activity/MonthlyActivity";
import UserHomePage from "./pages/user_home_page/UserHomePage";
import HouseholdDashboard from './pages/household-dashboard/HouseholdDashboard'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import { Link } from "react-router-dom"
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Temphome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<UserHomePage />} />
        <Route path="/create" element={<CreateHousehold />} />
        <Route path="/protocols" element={<Protocols />} />
        <Route path="/register" element={<Register />} />
        <Route path="/individual-protocol" element={<IndividualProtocol />} />
        <Route path="/assets" element={<AssetList />} />
        <Route path="/monthly-activity" element={<MonthlyActivity />} />
        <Route path="/household" element={<HouseholdDashboard />} />
      </Routes>
    </Router>
  )
}

export default App;
