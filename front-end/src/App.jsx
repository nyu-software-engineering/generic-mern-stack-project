
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ResultsPage from "./pages/ResultsPage";
import HomePage from "./pages/HomePage";
import HotelDetails from "./pages/HotelDetails";

function App() {
  return (
    <BrowserRouter>
    <div className="phone-screen">
      <div className="page-content">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/hotel/:id" element={<HotelDetails />} />
      </Routes>
    </div>




      {/* Parts below is for bottom navigation, also links are to be filled*/}
      <section className="bottom-nav">
        <Link to="/">home</Link>
        <Link to="/">search</Link>
        <Link to="/">saved</Link>
      </section>
      </div>
    </BrowserRouter>
  );
}

export default App;
