import { useState } from "react";
import CreateHousehold from "./pages/create_household/CreateHousehold";
import Temphome from "./pages/temp_home";
import IndividualProtocol from "./pages/individual_protocol/individual_protocol";
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
        <Route path="/register" element={<Register />} />
<<<<<<< HEAD
        <Route path="/individual-protocol" element={<IndividualProtocol />} />
=======
        <Route path="/assets" element={<AssetList />} />
>>>>>>> 7838aca332829b6e877b9cca01842d843ee2c08d
      </Routes>
    </Router>
  );
}

export default App;
