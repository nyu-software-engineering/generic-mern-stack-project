import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import Catalog from "./pages/Catalog";
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
        <Route path="/" element={<Navigate to="/login" replace/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/articles" element={<Catalog />} />
        <Route path="/articles/:id" element={<Article />} />
        <Route path="/mainpage" element={<MainPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/favorites" element={<Favorite />} />
        <Route path="/articles/:id/dejargoned/b" element={<Beginner />} />
        <Route path="/articles/:id/dejargoned/i" element={<Intermediate />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
