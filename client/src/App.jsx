import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import AccountCreated from './pages/AccountCreated'
import AdminDashboard from './pages/AdminDashboard'
import Overview from './pages/Overview'
import Marketplace from './pages/Marketplace'
import Policies from './pages/Policies'
import Claims from './pages/Claims'
import Proposals from './pages/Proposals'
import UserProfile from './pages/UserProfile'
import TravelProposalForm from './pages/TravelProposalForm'
import MotorProposalForm from './pages/MotorProposalForm'
import LifeProposalForm from './pages/LifeProposalForm'
import useDashboardData from './hooks/useDashboardData'

const DASHBOARD_PATHS = {
  overview: '/dashboard',
  marketplace: '/dashboard/marketplace',
  policies: '/dashboard/policies',
  claims: '/dashboard/claims',
  proposals: '/dashboard/proposals',
  profile: '/dashboard/profile',
  'proposal-travel': '/dashboard/proposals/travel',
  'proposal-motor': '/dashboard/proposals/motor',
  'proposal-life': '/dashboard/proposals/life',
}

function findProduct(products, key) {
  return products.find((product) => product.key === key) || null
}

function getCurrentPageLabel(pathname) {
  if (pathname.startsWith('/dashboard/marketplace')) return 'Marketplace'
  if (pathname.startsWith('/dashboard/policies')) return 'Policies'
  if (pathname.startsWith('/dashboard/claims')) return 'Claims'
  if (pathname.startsWith('/dashboard/proposals')) return 'Proposals'
  if (pathname.startsWith('/dashboard/profile')) return 'Profile'
  return 'Overview'
}

function DashboardRouter() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    user,
    products,
    catalogLoading,
    catalogError,
    proposals,
    proposalsLoading,
    proposalsError,
    refreshProposals,
    saveProfile,
    signOut,
  } = useDashboardData()

  const handleNavigate = (page) => {
    const path = DASHBOARD_PATHS[page] || DASHBOARD_PATHS.overview
    navigate(path)
  }

  const commonPageProps = {
    onNavigate: handleNavigate,
    onSignOut: async () => {
      await signOut()
      navigate('/')
    },
    user,
    currentPageLabel: getCurrentPageLabel(location.pathname),
  }

  return (
    <Routes>
      <Route
        index
        element={(
          <Overview
            {...commonPageProps}
            proposals={proposals}
            proposalsLoading={proposalsLoading}
            proposalsError={proposalsError}
            products={products}
          />
        )}
      />
      <Route
        path="marketplace"
        element={(
          <Marketplace
            {...commonPageProps}
            products={products}
            catalogLoading={catalogLoading}
            catalogError={catalogError}
          />
        )}
      />
      <Route
        path="policies"
        element={(
          <Policies
            {...commonPageProps}
            proposals={proposals}
            proposalsLoading={proposalsLoading}
            products={products}
          />
        )}
      />
      <Route
        path="claims"
        element={(
          <Claims
            {...commonPageProps}
            proposals={proposals}
          />
        )}
      />
      <Route
        path="proposals"
        element={(
          <Proposals
            {...commonPageProps}
            proposals={proposals}
            proposalsLoading={proposalsLoading}
            proposalsError={proposalsError}
            onRefresh={refreshProposals}
          />
        )}
      />
      <Route
        path="profile"
        element={(
          <UserProfile
            {...commonPageProps}
            proposals={proposals}
            products={products}
            onSaveProfile={saveProfile}
          />
        )}
      />
      <Route
        path="proposals/travel"
        element={(
          <TravelProposalForm
            onBack={() => navigate('/dashboard/marketplace')}
            onNavigate={handleNavigate}
            templateId={findProduct(products, 'travel')?.templateId}
          />
        )}
      />
      <Route
        path="proposals/motor"
        element={(
          <MotorProposalForm
            onBack={() => navigate('/dashboard/marketplace')}
            onNavigate={handleNavigate}
            templateId={findProduct(products, 'motor')?.templateId}
          />
        )}
      />
      <Route
        path="proposals/life"
        element={(
          <LifeProposalForm
            onBack={() => navigate('/dashboard/marketplace')}
            onNavigate={handleNavigate}
            templateId={findProduct(products, 'life')?.templateId}
          />
        )}
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/account-created" element={<AccountCreated />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/dashboard/*" element={<DashboardRouter />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
