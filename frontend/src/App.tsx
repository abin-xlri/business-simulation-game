import { Routes, Route } from 'react-router-dom'
import { SocketProvider } from './hooks/useSocket'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import JoinSessionPage from './pages/JoinSessionPage'
import GamePage from './pages/GamePage'
import DashboardPage from './pages/DashboardPage'
import CompanyPage from './pages/CompanyPage'
import MarketPage from './pages/MarketPage'
import LeaderboardPage from './pages/LeaderboardPage'
import Round1Task1Page from './pages/Round1Task1Page'
import Round1Task2Page from './pages/Round1Task2Page'
import Round2MarketSelectionPage from './pages/Round2MarketSelectionPage'
import Round2BudgetAllocationPage from './pages/Round2BudgetAllocationPage'
import GroupManagementPage from './pages/GroupManagementPage'
import { Round3Page } from './pages/Round3Page'
import AdminDashboard from './pages/AdminDashboard'
import SimulationLayout from './components/SimulationLayout'
import { useGlobalTaskRedirect } from './hooks/useGlobalTaskRedirect'

function App() {
  // Globally listen for orchestrator task changes and redirect students accordingly
  function OrchestratorListener() {
    useGlobalTaskRedirect();
    return null;
  }

  return (
    <AuthProvider>
      <SocketProvider>
        <OrchestratorListener />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route path="/join-session" element={
            <ProtectedRoute>
              <JoinSessionPage />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/game" element={
            <ProtectedRoute>
              <Layout>
                <GamePage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/company" element={
            <ProtectedRoute>
              <Layout>
                <CompanyPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/market" element={
            <ProtectedRoute>
              <Layout>
                <MarketPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <Layout>
                <LeaderboardPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* Simulation flow routes (use session-aware layout) */}
          <Route path="/" element={<ProtectedRoute><SimulationLayout /></ProtectedRoute>}>
            <Route path="round1/task1/:sessionId" element={<Round1Task1Page />} />
            <Route path="round1/task2/:sessionId" element={<Round1Task2Page />} />
            <Route path="round2/market-selection/:sessionId" element={<Round2MarketSelectionPage />} />
            <Route path="round2/budget-allocation/:sessionId" element={<Round2BudgetAllocationPage />} />
            <Route path="round3/:sessionId" element={<Round3Page />} />
            <Route path="leaderboard/:sessionId" element={<Layout><LeaderboardPage /></Layout>} />
          </Route>

          <Route path="/groups" element={
            <ProtectedRoute>
              <GroupManagementPage />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App 