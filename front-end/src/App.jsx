import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import Article from "./pages/Article";
import DeJargoned from "./pages/DeJargoned";
import MainPage from "./pages/MainPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Favorite from "./pages/Favorite.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/article" element={<Article />} />
        <Route path="/De-Jargoned" element={<DeJargoned />} />
        <Route path="/" element={<MainPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/favorites" element={<Favorite />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
