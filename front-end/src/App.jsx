import { useState } from "react";
import CreateHousehold from "./pages/create_household/CreateHousehold";
import Temphome from "./pages/temp_home";
import IndividualProtocol from "./pages/individual_protocol/individual_protocol";
import React from "react";
import Register from "./pages/register/register";
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
        <Route path="/register" element={<Register />} />
        <Route path="/individual-protocol" element={<IndividualProtocol />} />
      </Routes>
    </Router>
  );
}

export default App;
