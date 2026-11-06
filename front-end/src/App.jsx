import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import OrganizationView from './pages/OrganizationView';
import ClubDetails from './pages/ClubDetails';
import Favorites from './pages/Favorites';
import { FavoritesProvider } from './context/FavoritesContext';
import CalendarView from './pages/CalendarView';
import AddFlyer from './pages/AddFlyer';
import MapView from './pages/MapView';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Support from './pages/Support';

export default function App() {
  return (
    <BrowserRouter>
      <FavoritesProvider>
      <Routes>
        {/* No Header or NavBar */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Application pages */}
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/organizations" element={<OrganizationView />} />
          <Route path="/organizations/:clubId" element={<ClubDetails />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/add-flyer" element={<AddFlyer />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/support" element={<Support />} />
        </Route>
      </Routes>
      </FavoritesProvider>
    </BrowserRouter>
  );
}