// import "./App.css";

// import Login from "./pages/Login";
// function App() {
//   return <Login />;
// }

// export default App;

// import Register from "./pages/Register";

// function App() {
//   return <Register />;
// }

// export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import Article from "./pages/Article";
import DeJargoned from "./pages/DeJargoned";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/article" element={<Article />} />
        <Route path="/De-Jargoned" element={<DeJargoned />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
