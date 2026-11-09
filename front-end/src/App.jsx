import { useState } from "react";
import CreateHousehold from "./pages/create_household/CreateHousehold";
import Login from "./pages/login/Login";
import IndividualProtocol from "./pages/individual_protocol/individual_protocol";
import Protocols from "./pages/protocols/Protocols";
import React from "react";
import Register from "./pages/register/register";
import AssetList from "./pages/assets/AssetList";
import MonthlyActivity from "./pages/monthly_activity/MonthlyActivity";
import UserHomePage from "./pages/user_home_page/UserHomePage";
import ManageMembersPage from "./pages/manage_members/ManageMembers";
import HouseholdDashboard from "./pages/household-dashboard/HouseholdDashboard";
import ProtocolProposal from "./pages/protocol_proposal/protocol_proposal";
import Profile from "./pages/profile/profile";
import CreateAsset from "./pages/assets/CreateAsset";
import ExpenseList from "./pages/expense_list/ExpenseList";
import JoinHousehold from "./pages/join_household/join_household"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import { Link } from "react-router-dom"
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<UserHomePage />} />
        <Route path="/create" element={<CreateHousehold />} />
        <Route path="/protocols" element={<Protocols />} />
        <Route path="/register" element={<Register />} />
        <Route path="/individual-protocol" element={<IndividualProtocol />} />
        <Route path="/assets" element={<AssetList />} />
        <Route path="/assets/create" element={<CreateAsset />} />
        <Route path="/expenses" element={<ExpenseList />} />
        <Route path="/monthly-activity" element={<MonthlyActivity />} />
        <Route path="/manage-members" element={<ManageMembersPage />} />
        <Route path="/household" element={<HouseholdDashboard />} />
        <Route path="/new_protocol" element={<ProtocolProposal />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/join-household" element={<JoinHousehold/>}/>
      </Routes>
    </Router>
  );
}

export default App;
