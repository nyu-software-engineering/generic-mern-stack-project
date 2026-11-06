import CreateHousehold from './pages/create_household/CreateHousehold'
import Login from './pages/login/Login'
import TempHome from './pages/temp_home'
import Protocols from './pages/protocols/Protocols'
import Register from './pages/register/register'
import AssetList from './pages/assets/AssetList'
import MonthlyActivity from './pages/monthly_activity/MonthlyActivity'
import UserHomePage from './pages/user_home_page/UserHomePage'
import HouseholdDashboard from './pages/household-dashboard/HouseholdDashboard'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TempHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<UserHomePage />} />
        <Route path="/create" element={<CreateHousehold />} />
        <Route path="/protocols" element={<Protocols />} />
        <Route path="/register" element={<Register />} />
        <Route path="/assets" element={<AssetList />} />
        <Route path="/monthly-activity" element={<MonthlyActivity />} />
        <Route path="/household" element={<HouseholdDashboard />} />
      </Routes>
    </Router>
  )
}

export default App;
