import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import ScrollToHash from './components/ScrollToHash'
import AdminLayout from './components/admin/AdminLayout'
import HomePage from './pages/HomePage'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import AccountCreated from './pages/AccountCreated'
import About from './pages/About'
import AdminDashboard from './pages/AdminDashboard'
import AdminClaimsReview from './pages/admin/AdminClaimsReview'
import AdminCustomMinting from './pages/admin/AdminCustomMinting'
import AdminPolicyProposals from './pages/admin/AdminPolicyProposals'
import AdminPolicyTemplates from './pages/admin/AdminPolicyTemplates'
import AdminRevocation from './pages/admin/AdminRevocation'
import AdminUsers from './pages/admin/AdminUsers'
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
  const searchParams = new URLSearchParams(location.search)
  const selectedTemplateId = searchParams.get('templateId')
  const {
    user,
    products,
    templates,
    catalogLoading,
    catalogError,
    profileReady,
    missingProfileFields,
    proposals,
    proposalsLoading,
    proposalsError,
    refreshProposals,
    saveProfile,
    signOut,
  } = useDashboardData()

  const handleNavigate = (page) => {
    if (typeof page === 'string' && page.startsWith('/')) {
      navigate(page)
      return
    }

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

  if (!user) {
    return <Navigate to="/signin" replace />
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
            profileReady={profileReady}
            missingProfileFields={missingProfileFields}
          />
        )}
      />
      <Route
        path="marketplace"
        element={(
          <Marketplace
            {...commonPageProps}
            products={products}
            templates={templates}
            catalogLoading={catalogLoading}
            catalogError={catalogError}
            profileReady={profileReady}
            missingProfileFields={missingProfileFields}
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
            missingProfileFields={missingProfileFields}
          />
        )}
      />
      <Route
        path="proposals/travel"
        element={(
          <TravelProposalForm
            onBack={() => navigate('/dashboard/marketplace')}
            onNavigate={handleNavigate}
            user={user}
            product={findProduct(products, 'travel')}
            templateId={selectedTemplateId || findProduct(products, 'travel')?.template?.id || findProduct(products, 'travel')?.templateId}
            missingProfileFields={missingProfileFields}
            onProposalSubmitted={refreshProposals}
          />
        )}
      />
      <Route
        path="proposals/motor"
        element={(
          <MotorProposalForm
            onBack={() => navigate('/dashboard/marketplace')}
            onNavigate={handleNavigate}
            user={user}
            product={findProduct(products, 'motor')}
            templateId={selectedTemplateId || findProduct(products, 'motor')?.template?.id || findProduct(products, 'motor')?.templateId}
            missingProfileFields={missingProfileFields}
            onProposalSubmitted={refreshProposals}
          />
        )}
      />
      <Route
        path="proposals/life"
        element={(
          <LifeProposalForm
            onBack={() => navigate('/dashboard/marketplace')}
            onNavigate={handleNavigate}
            user={user}
            product={findProduct(products, 'life')}
            templateId={selectedTemplateId || findProduct(products, 'life')?.template?.id || findProduct(products, 'life')?.templateId}
            missingProfileFields={missingProfileFields}
            onProposalSubmitted={refreshProposals}
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
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/account-created" element={<AccountCreated />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="templates" element={<AdminPolicyTemplates />} />
          <Route path="claims" element={<AdminClaimsReview />} />
          <Route path="minting" element={<AdminCustomMinting />} />
          <Route path="revocation" element={<AdminRevocation />} />
          <Route path="proposals" element={<AdminPolicyProposals />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
        <Route path="/dashboard/*" element={<DashboardRouter />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
