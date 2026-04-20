import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginAdmin, loginUser, registerAdmin } from '../lib/api'
import { createWalletRegistration, hashPassword } from '../lib/auth'
import { saveStoredUser } from '../lib/session'

const DEMO_ADMIN_CREDENTIALS = [
  { email: 'admin@gmail.com', password: 'admin@123' },
  { email: 'admin@chainsure.com', password: 'admin@123' },
]

const DEMO_ADMIN_ALIASES = [
  'admin@chainsure.com',
  'admin@gmail.com',
  'devadmin@chainsure.com',
]

function getDemoAdminEmails(primaryEmail) {
  return Array.from(new Set([primaryEmail, ...DEMO_ADMIN_ALIASES]))
}

function looksLikeAdminEmail(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase()

  return DEMO_ADMIN_ALIASES.includes(normalizedEmail) || normalizedEmail.includes('admin')
}

async function ensureDemoAdminSession(normalizedEmail, password, passwordHash) {
  const candidateEmails = getDemoAdminEmails(normalizedEmail)
  let lastError = null

  for (const candidateEmail of candidateEmails) {
    try {
      const response = await loginAdmin({ email: candidateEmail, passwordHash })
      const adminUser = response?.data?.user

      if (adminUser?.role === 'admin') {
        return adminUser
      }
    } catch (error) {
      lastError = error
    }
  }

  const registration = await createWalletRegistration(password)

  for (const candidateEmail of candidateEmails) {
    try {
      const response = await registerAdmin({
        fullName: 'ChainSure Admin',
        email: candidateEmail,
        ...registration,
      })

      return response?.data?.user
    } catch (error) {
      lastError = error

      if (error?.status === 409) {
        try {
          const response = await loginAdmin({ email: candidateEmail, passwordHash })
          const adminUser = response?.data?.user

          if (adminUser?.role === 'admin') {
            return adminUser
          }
        } catch (loginError) {
          lastError = loginError
        }
      }
    }
  }

  throw lastError || new Error('Unable to provision a demo admin account on this backend.')
}

export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)

    try {
      const normalizedEmail = email.trim().toLowerCase()
      const passwordHash = await hashPassword(password)
      const payload = { email: normalizedEmail, passwordHash }

      try {
        const response = await loginUser(payload)
        const user = response?.data?.user

        saveStoredUser(user)
        navigate(user?.role === 'admin' ? '/admin' : '/dashboard')
        return
      } catch (userLoginError) {
        if (!looksLikeAdminEmail(normalizedEmail)) {
          throw userLoginError
        }

        try {
          const response = await loginAdmin(payload)
          const adminUser = response?.data?.user

          if (adminUser?.role !== 'admin') {
            throw userLoginError
          }

          saveStoredUser(adminUser)
          navigate('/admin')
          return
        } catch (adminLoginError) {
          const isDemoAdmin = DEMO_ADMIN_CREDENTIALS.some((credential) => (
            credential.email === normalizedEmail && credential.password === password
          ))

          if (isDemoAdmin) {
            const adminUser = await ensureDemoAdminSession(normalizedEmail, password, passwordHash)
            saveStoredUser(adminUser)
            navigate('/admin')
            return
          }

          throw adminLoginError?.message ? adminLoginError : userLoginError
        }
      }
    } catch (loginError) {
      setError(loginError.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#0f1729] mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="flex items-center gap-2 mb-8">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0f1729" strokeWidth="2" strokeLinejoin="round" className="flex-shrink-0">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#0f1729] mb-1">Welcome Back</h1>
          <p className="text-gray-500 text-sm mb-6">Sign in to your insurance account</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729]"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-[#0f1729] focus:ring-[#0f1729]" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-[#0f1729] hover:underline">Forgot Password?</Link>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#0f1729] text-white font-medium rounded-lg hover:bg-[#1e293b] transition-colors disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#0f1729] font-medium hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
