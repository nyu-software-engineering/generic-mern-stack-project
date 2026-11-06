import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import Article from "./pages/Article";
import MainPage from "./pages/MainPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Favorite from "./pages/Favorite.jsx";
import Beginner from "./pages/dejargoned/beginner.jsx";
import Intermediate from "./pages/dejargoned/intermediate.jsx";
  

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/article" element={<Article />} />
        <Route path="/" element={<MainPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/favorites" element={<Favorite />} />
        <Route path="/dejargoned/beginner" element={<Beginner />} />
        <Route path="/dejargoned/intermediate" element={<Intermediate />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
