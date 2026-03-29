import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ScrollToHash from './components/ScrollToHash'
import HomePage from './pages/HomePage'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import AccountCreated from './pages/AccountCreated'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import About from './pages/About'
import AdminDashboard from './pages/AdminDashboard'
import AdminLayout from './components/admin/AdminLayout'
import AdminPolicyTemplates from './pages/admin/AdminPolicyTemplates'
import AdminClaimsReview from './pages/admin/AdminClaimsReview'
import AdminCustomMinting from './pages/admin/AdminCustomMinting'
import AdminRevocation from './pages/admin/AdminRevocation'
import AdminPolicyProposals from './pages/admin/AdminPolicyProposals'
import AdminUsers from './pages/admin/AdminUsers'


function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/account-created" element={<AccountCreated />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="templates" element={<AdminPolicyTemplates />} />
          <Route path="claims" element={<AdminClaimsReview />} />
          <Route path="minting" element={<AdminCustomMinting />} />
          <Route path="revocation" element={<AdminRevocation />} />
          <Route path="proposals" element={<AdminPolicyProposals />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
