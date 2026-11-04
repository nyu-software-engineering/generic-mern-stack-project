import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import AppLayout from './components/layout/AppLayout.jsx'
import AccountPage from './pages/account/AccountPage.jsx'
import AchievementsPage from './pages/account/AchievementsPage.jsx'
import BadgeDetailPage from './pages/account/BadgeDetailPage.jsx'
import ProfilePage from './pages/account/ProfilePage.jsx'
import AuthPage from './pages/auth/AuthPage.jsx'
import LeaderboardPage from './pages/leaderboard/LeaderboardPage.jsx'
import GlossaryPage from './pages/learn/GlossaryPage.jsx'
import LearnLayout from './pages/learn/LearnLayout.jsx'
import LearnPage from './pages/learn/LearnPage.jsx'
import LessonPage from './pages/learn/LessonPage.jsx'
import MarketPage from './pages/market/MarketPage.jsx'
import NotFoundPage from './pages/not-found/NotFoundPage.jsx'
import HoldingDetailPage from './pages/portfolio/HoldingDetailPage.jsx'
import PerformancePage from './pages/portfolio/PerformancePage.jsx'
import PortfolioPage from './pages/portfolio/PortfolioPage.jsx'
import TransactionDetailPage from './pages/portfolio/TransactionDetailPage.jsx'
import TransactionsPage from './pages/portfolio/TransactionsPage.jsx'
import WelcomePage from './pages/welcome/WelcomePage.jsx'

function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    const heading = document.querySelector('main h1')
    document.title = heading ? `${heading.textContent} | StockSim` : 'StockSim'
    heading?.focus({ preventScroll: true })
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/create-account" element={<AuthPage key="create-account" creatingAccount />} />
      <Route path="/login" element={<AuthPage key="login" />} />
      <Route element={<AppLayout />}>
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="portfolio/performance" element={<PerformancePage />} />
        <Route path="portfolio/holdings/:symbol" element={<HoldingDetailPage />} />
        <Route path="portfolio/transactions" element={<TransactionsPage />} />
        <Route path="portfolio/transactions/:transactionId" element={<TransactionDetailPage />} />
        <Route path="market" element={<MarketPage />} />
        <Route path="learn" element={<LearnLayout />}>
          <Route index element={<LearnPage />} />
          <Route path="glossary" element={<GlossaryPage />} />
          <Route path=":lessonId" element={<LessonPage />} />
        </Route>
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="account/profile" element={<ProfilePage />} />
        <Route path="account/achievements" element={<AchievementsPage />} />
        <Route path="account/achievements/:badgeId" element={<BadgeDetailPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
