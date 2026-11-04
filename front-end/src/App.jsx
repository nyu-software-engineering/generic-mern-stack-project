import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import ResultsPage from "./pages/ResultsPage";
import HomePage from "./pages/HomePage";
import Saved from "./pages/Saved";
import EditSaved from "./pages/EditSaved";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";

const hideNavOn = ["/signin", "/signup"];

function AppContent() {
  const { pathname } = useLocation();
  const showNav = !hideNavOn.includes(pathname);

  return (
    <div className="phone-screen">
      <div className="page-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/editsaved" element={<EditSaved />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </div>

      {/* Bottom navigation, links are to be filled */}
      {showNav ? (
        <nav className="bottom-nav">
          <Link to="/">home</Link>
          <Link to="/saved">saved</Link>
          <Link to="/">profile</Link>
        </nav>
      ) : null}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
