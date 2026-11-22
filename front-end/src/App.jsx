import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import ResultsPage from "./pages/ResultsPage";
import HomePage from "./pages/HomePage";
import HotelDetails from "./pages/HotelDetails";
import Saved from "./pages/Saved";
import EditSaved from "./pages/EditSaved";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import { SavedContent } from "./shared_content/SavedContent";
import { SavedCurrentBooking } from "./shared_content/SavedCurrentBookings";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

const hideNavOn = ["/signin", "/signup"];

const HomeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#000"
    strokeWidth="1"
    strokeLinejoin="round"
  >
    <path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V11z" />
  </svg>
);

const SavedIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#000"
    strokeWidth="1"
    strokeLinejoin="round"
  >
    <path d="M6 3h12v18l-6-4-6 4V3z" />
  </svg>
);

const ProfileIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#000"
    strokeWidth="1"
    strokeLinecap="round"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

function AppContent() {
  const { pathname } = useLocation();
  const showNav = !hideNavOn.includes(pathname);

  return (
    <div className="phone-screen">
      <div className="page-content">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/editsaved" element={<EditSaved />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/hotel/:id" element={<HotelDetails />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>

      {/* Bottom navigation, links are to be filled */}
      {showNav ? (
        <nav className="bottom-nav">
          <Link to="/">
            <HomeIcon />
          </Link>
          <Link to="/saved">
            <SavedIcon />
          </Link>
          <Link to="/profile">
            <ProfileIcon />
          </Link>
        </nav>
      ) : null}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SavedContent>
        <SavedCurrentBooking>
          <AppContent />
        </SavedCurrentBooking>
      </SavedContent>
    </BrowserRouter>
  );
}

export default App;
