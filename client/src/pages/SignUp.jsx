import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser, updateUserProfile } from '../lib/api'
import { createWalletRegistration } from '../lib/auth'
import { saveStoredUser } from '../lib/session'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getProfileSetupErrorMessage(error) {
  const message = error?.message || 'Profile details could not be saved.'
  const stack = String(error?.data?.stack || '')

  if (
    message === 'Validation error'
    || /unique/i.test(message)
    || /unique/i.test(stack)
    || /cid/i.test(stack)
  ) {
    return 'Your account was created, but the CID is already linked to another account. Sign in and update the profile with a different CID, or use the account that already owns that CID.'
  }

  return `Your account was created, but the profile details could not be saved: ${message}`
}

export default function SignUp() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    cid: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required'
        if (value.trim().length < 2) return 'Full name must be at least 2 characters'
        return ''
      case 'cid':
        if (!value.trim()) return 'CID is required'
        if (value.trim().length !== 11) return 'CID must be 11 characters'
        return ''
      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address'
        return ''
      case 'password':
        if (!value) return 'Password is required'
        if (value.length < 8) return 'Password must be at least 8 characters'
        return ''
      case 'confirmPassword':
        if (!value) return 'Please confirm your password'
        if (value !== formData.password) return 'Passwords do not match'
        return ''
      default:
        return ''
    }
  }

  const validateForm = () => {
    const newErrors = {}
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key])
      if (err) newErrors[key] = err
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isFormValid = () => {
    const required = ['fullName', 'cid', 'email', 'password', 'confirmPassword']
    if (!required.every((key) => formData[key]?.trim())) return false
    if (!EMAIL_REGEX.test(formData.email)) return false
    if (formData.cid.trim().length !== 11) return false
    if (formData.password.length < 8) return false
    if (formData.password !== formData.confirmPassword) return false
    return true
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const nextFormData = { ...formData, [name]: value }
    setFormData(nextFormData)
    if (touched[name]) {
      const err = name === 'confirmPassword'
        ? (value !== nextFormData.password ? 'Passwords do not match' : '')
        : validateField(name, value)
      setErrors((prev) => ({ ...prev, [name]: err }))
    }
    if (name === 'password' && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: nextFormData.confirmPassword !== value ? 'Passwords do not match' : ''
      }))
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, formData[name]) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ fullName: true, cid: true, email: true, password: true, confirmPassword: true })
    if (!validateForm()) return

    setSubmitting(true)

    try {
      const walletRegistration = await createWalletRegistration(formData.password)
      const registerResponse = await registerUser({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        passwordHash: walletRegistration.passwordHash,
        walletAddress: walletRegistration.walletAddress,
        encryptedPrivateKey: walletRegistration.encryptedPrivateKey,
        salt: walletRegistration.salt,
      })

      let userSnapshot = registerResponse?.data?.user

      try {
        const profileResponse = await updateUserProfile({
          cid: formData.cid.trim(),
        })

        userSnapshot = {
          ...userSnapshot,
          ...profileResponse?.data,
        }
      } catch (profileError) {
        saveStoredUser(userSnapshot)
        navigate('/dashboard/profile', {
          replace: true,
          state: {
            profileError: getProfileSetupErrorMessage(profileError),
          },
        })
        return
      }

      saveStoredUser(userSnapshot)
      navigate('/account-created', { state: { walletAddress: walletRegistration.walletAddress } })
    } catch (submitError) {
      setErrors((previous) => ({
        ...previous,
        submit: submitError.message || 'Could not create your account.',
      }))
    } finally {
      setSubmitting(false)
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
          <h1 className="text-2xl font-bold text-[#0f1729] mb-1">Create Account</h1>
          <p className="text-gray-500 text-sm mb-6">Set up your profile</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {errors.submit}
              </div>
            )}
            <div>
              <label className="block text-sm text-gray-500 mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </span>
                <input
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729] ${errors.fullName ? 'border-red-500' : 'border-gray-200'}`}
                />
              </div>
              {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">CID</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                </span>
                <input
                  name="cid"
                  type="text"
                  placeholder="Enter your CID"
                  value={formData.cid}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729] ${errors.cid ? 'border-red-500' : 'border-gray-200'}`}
                />
              </div>
              {errors.cid && <p className="mt-1 text-sm text-red-500">{errors.cid}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </span>
                <input
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729] ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </span>
                <input
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729] ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </span>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Enter password again"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729] ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'}`}
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
            <button
              type="submit"
              disabled={!isFormValid() || submitting}
              className={`w-full py-3 font-medium rounded-lg transition-colors ${isFormValid() && !submitting ? 'bg-[#0f1729] text-white hover:bg-[#1e293b] cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              {submitting ? 'Creating Account...' : 'Continue'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/signin" className="text-[#0f1729] font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
