import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./MainPage.jsx";
import Dashboard from "./Dashboard.jsx";
import Favorite from "./Favorite.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/favorite" element={<Favorite />} />
      </Routes>
    </BrowserRouter>
  );
}