import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import ScrollToHash from './components/ScrollToHash'
import AdminLayout from './components/admin/AdminLayout'
import HomePage from './pages/HomePage'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import AccountCreated from './pages/AccountCreated'
import About from './pages/About'
import PublicPolicies from './pages/PublicPolicies'
import AdminDashboard from './pages/AdminDashboard'
import AdminClaimsReview from './pages/admin/AdminClaimsReview'
import AdminCustomMinting from './pages/admin/AdminCustomMinting'
import AdminPolicyProposals from './pages/admin/AdminPolicyProposals'
import AdminPolicyTemplates from './pages/admin/AdminPolicyTemplates'
import AdminRevocation from './pages/admin/AdminRevocation'
import AdminUsers from './pages/admin/AdminUsers'
import Overview from './pages/Overview'
import Marketplace from './pages/Marketplace'
import ProductPolicies from './pages/ProductPolicies'
import Policies from './pages/Policies'
import Claims from './pages/Claims'
import Proposals from './pages/Proposals'
import UserProfile from './pages/UserProfile'
import PropertyProposalForm from './pages/PropertyProposalForm'
import MotorProposalForm from './pages/MotorProposalForm'
import HealthProposalForm from './pages/HealthProposalForm'
import useDashboardData from './hooks/useDashboardData'
import ExplorerPage from './pages/Explorer'

const DASHBOARD_PATHS = {
  overview: '/dashboard',
  marketplace: '/dashboard/marketplace',
  policies: '/dashboard/policies',
  claims: '/dashboard/claims',
  proposals: '/dashboard/proposals',
  profile: '/dashboard/profile',
  'proposal-property': '/dashboard/proposals/property',
  'proposal-motor': '/dashboard/proposals/motor',
  'proposal-health': '/dashboard/proposals/health',
}

function findProduct(products, key) {
  return products.find((product) => product.key === key) || null
}

function findTemplateById(templates, templateId) {
  if (!templateId) {
    return null
  }

  return templates.find((template) => template.id === templateId) || null
}

function getSelectedTemplateId(location) {
  return new URLSearchParams(location.search).get('templateId') || ''
}

function resolveFormProduct(products, templates, key, templateId) {
  const product = findProduct(products, key)
  const selectedTemplate = findTemplateById(templates, templateId)

  if (!selectedTemplate) {
    return product
  }

  return {
    ...product,
    template: selectedTemplate,
    templateId: selectedTemplate.id,
    templateStatus: 'ready',
    templateSource: 'selected',
  }
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

  const handleNavigate = (page, options = {}) => {
    if (page === 'product-policies' && options.productKey) {
      navigate(`/dashboard/marketplace/${encodeURIComponent(options.productKey)}`)
      return
    }

    const path = DASHBOARD_PATHS[page] || DASHBOARD_PATHS.overview
    const search = options.templateId ? `?templateId=${encodeURIComponent(options.templateId)}` : ''
    navigate(`${path}${search}`)
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

  const selectedTemplateId = getSelectedTemplateId(location)

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
        path="marketplace/:productKey"
        element={(
          <ProductPolicies
            {...commonPageProps}
            products={products}
            templates={templates}
            catalogLoading={catalogLoading}
            profileReady={profileReady}
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
        path="proposals/property"
        element={(
          <PropertyProposalForm
            onBack={() => navigate('/dashboard/marketplace')}
            onNavigate={handleNavigate}
            user={user}
            product={resolveFormProduct(products, templates, 'travel', selectedTemplateId)}
            templateId={resolveFormProduct(products, templates, 'travel', selectedTemplateId)?.template?.id || resolveFormProduct(products, templates, 'travel', selectedTemplateId)?.templateId}
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
            product={resolveFormProduct(products, templates, 'motor', selectedTemplateId)}
            templateId={resolveFormProduct(products, templates, 'motor', selectedTemplateId)?.template?.id || resolveFormProduct(products, templates, 'motor', selectedTemplateId)?.templateId}
            missingProfileFields={missingProfileFields}
            onProposalSubmitted={refreshProposals}
          />
        )}
      />
      <Route
        path="proposals/health"
        element={(
          <HealthProposalForm
            onBack={() => navigate('/dashboard/marketplace')}
            onNavigate={handleNavigate}
            user={user}
            product={resolveFormProduct(products, templates, 'life', selectedTemplateId)}
            templateId={resolveFormProduct(products, templates, 'life', selectedTemplateId)?.template?.id || resolveFormProduct(products, templates, 'life', selectedTemplateId)?.templateId}
            missingProfileFields={missingProfileFields}
            onProposalSubmitted={refreshProposals}
          />
        )}
      />
      <Route path="proposals/travel" element={<Navigate to="/dashboard/proposals/property" replace />} />
      <Route path="proposals/life" element={<Navigate to="/dashboard/proposals/health" replace />} />
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
        <Route path="/browse-policies" element={<PublicPolicies />} />
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
        <Route path="/explorer" element={<ExplorerPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
