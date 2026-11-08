import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import AddItemPage from './pages/AddItemPage'
import BulkLogPage from './pages/BulkLogPage'
import ClosetPage from './pages/ClosetPage'
import ClosetSummaryPage from './pages/ClosetSummaryPage'
import DashboardPage from './pages/DashboardPage'
import EditEmailPage from './pages/EditEmailPage'
import EditItemPage from './pages/EditItemPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ItemDetailPage from './pages/ItemDetailPage'
import ItemRankingsPage from './pages/ItemRankingsPage'
import LogInPage from './pages/LogInPage'
import NotFoundPage from './pages/NotFoundPage'
import ProfilePage from './pages/ProfilePage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import SignUpPage from './pages/SignUpPage'
import SpendByCategoryPage from './pages/SpendByCategoryPage'
import WelcomePage from './pages/WelcomePage'


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LogInPage />} />
        <Route path="/profile/reset-password" element={<ResetPasswordPage />} />
        
        <Route element={<AppLayout />}>
          <Route path="/closet" element={<ClosetPage />} />
          <Route path="/closet/new" element={<AddItemPage />} />
          <Route path="/closet/:itemId" element={<ItemDetailPage />} />
          <Route path="/closet/:itemId/edit" element={<EditItemPage />} />
          <Route path="/closet/:itemId/bulk-log" element={<BulkLogPage />} />

          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/summary" element={<ClosetSummaryPage />} />
          <Route path="/dashboard/rankings" element={<ItemRankingsPage />} />
          <Route path="/dashboard/categories" element={<SpendByCategoryPage />} />

          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit-email" element={<EditEmailPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}