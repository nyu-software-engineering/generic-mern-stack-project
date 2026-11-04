
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ResultsPage from "./pages/ResultsPage";
import HomePage from "./pages/HomePage";
import Saved from "./pages/Saved";
import EditSaved from "./pages/EditSaved";
import SignUp from "./SignUp";
import SignIn from "./SignIn";


function App() {
  return (
    <BrowserRouter>
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




      {/* Parts below is for bottom navigation, also links are to be filled*/}
      <nav className="bottom-nav">
        <Link to="/">home</Link>
        <Link to="/saved">saved</Link>
        <Link to="/">profile</Link>
      </nav>
      </div>
    </BrowserRouter>
  );
}

export default App;
