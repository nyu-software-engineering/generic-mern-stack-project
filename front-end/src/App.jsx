import { Route, Routes } from 'react-router'
import AppLayout from './components/layout/AppLayout.jsx'
import ActiveShareLinks from './screens/ActiveShareLinks.jsx'
import CheckApartment from './screens/CheckApartment.jsx'
import ChooseApartment from './screens/ChooseApartment.jsx'
import ComparableApartments from './screens/ComparableApartments.jsx'
import ConnectBank from './screens/ConnectBank.jsx'
import ExploreAreas from './screens/ExploreAreas.jsx'
import FollowedAreas from './screens/FollowedAreas.jsx'
import ForgotPassword from './screens/ForgotPassword.jsx'
import Home from './screens/Home.jsx'
import LandlordHome from './screens/LandlordHome.jsx'
import LandlordReportView from './screens/LandlordReportView.jsx'
import LogIn from './screens/LogIn.jsx'
import NegotiationMessage from './screens/NegotiationMessage.jsx'
import NotFound from './screens/NotFound.jsx'
import Notifications from './screens/Notifications.jsx'
import PriceResult from './screens/PriceResult.jsx'
import Profile from './screens/Profile.jsx'
import ReceivedReports from './screens/ReceivedReports.jsx'
import RecordOutcome from './screens/RecordOutcome.jsx'
import ReliabilityReport from './screens/ReliabilityReport.jsx'
import RentTrends from './screens/RentTrends.jsx'
import ResetPassword from './screens/ResetPassword.jsx'
import SignUp from './screens/SignUp.jsx'

export default function App() {
  return (
      <div className="mx-auto min-h-screen max-w-md bg-canvas">
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/r/:linkId" element={<LandlordReportView />} />

        <Route element={<AppLayout role="renter" />}>
          <Route index element={<Home />} />
          <Route path="check" element={<CheckApartment />} />
          <Route path="check/result" element={<PriceResult />} />
          <Route path="check/comparables" element={<ComparableApartments />} />
          <Route path="connect-bank" element={<ConnectBank />} />
          <Route path="report" element={<ReliabilityReport />} />
          <Route path="share-links" element={<ActiveShareLinks />} />
          <Route path="areas/:areaId" element={<RentTrends />} />
          <Route path="followed-areas" element={<FollowedAreas />} />
          <Route path="explore" element={<ExploreAreas />} />
          <Route path="negotiate" element={<ChooseApartment />} />
          <Route path="negotiate/:checkId" element={<NegotiationMessage />} />
          <Route path="negotiate/:checkId/outcome" element={<RecordOutcome />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="landlord" element={<AppLayout role="landlord" />}>
          <Route index element={<LandlordHome />} />
          <Route path="reports" element={<ReceivedReports />} />
          <Route path="reports/:reportId" element={<LandlordReportView />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}