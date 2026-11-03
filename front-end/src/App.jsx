import { Routes, Route, Navigate } from 'react-router'
import Layout from './components/Layout'

import Login from './pages/Login'
import Signup from './pages/Signup'
import ChooseUsername from './pages/ChooseUsername'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import MapTab from './pages/MapTab'
import Create from './pages/Create'
import Friends from './pages/Friends'
import Profile from './pages/Profile'
import Identifying from './pages/Identifying'
import SuggestedMatches from './pages/SuggestedMatches'
import SearchPlace from './pages/SearchPlace'
import SaveSuccess from './pages/SaveSuccess'
import CityPage from './pages/CityPage'
import Members from './pages/Members'
import PlaceDetail from './pages/PlaceDetail'
import EditPlace from './pages/EditPlace'
import EditProfile from './pages/EditProfile'
import ChangePassword from './pages/ChangePassword'
import Invites from './pages/Invites'
import InviteToList from './pages/InviteToList'

export default function App() {
  return (
    <Routes>
      {/* no tab bar */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/username" element={<ChooseUsername />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* with tab bar */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapTab />} />
        <Route path="/create" element={<Create />} />
        <Route path="/create/identifying" element={<Identifying />} />
        <Route path="/create/matches" element={<SuggestedMatches />} />
        <Route path="/create/search" element={<SearchPlace />} />
        <Route path="/create/success" element={<SaveSuccess />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/invites" element={<Invites />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/profile/password" element={<ChangePassword />} />
        <Route path="/city/:cityId" element={<CityPage />} />
        <Route path="/city/:cityId/members" element={<Members />} />
        <Route path="/city/:cityId/invite" element={<InviteToList />} />
        <Route path="/place/:placeId" element={<PlaceDetail />} />
        <Route path="/place/:placeId/edit" element={<EditPlace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}