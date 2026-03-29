import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../lib/auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getPasswordError(value) {
  if (!value) return 'Password is required'
  if (value.length < 12) return 'Password must be at least 12 characters'
  if (!/[A-Z]/.test(value)) return 'Must contain at least one uppercase letter'
  if (!/[a-z]/.test(value)) return 'Must contain at least one lowercase letter'
  if (!/\d/.test(value)) return 'Must contain at least one number'
  if (!/[^A-Z0-9]/i.test(value)) return 'Must contain at least one special character'
  return ''
}

function deriveFullNameFromEmail(email) {
  const localPart = email.split('@')[0] || ''
  const cleaned = localPart.replace(/[._-]+/g, ' ').trim()
  if (!cleaned) return 'User'
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

export default function SignUp() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!EMAIL_REGEX.test(value)) return 'Please enter a valid email address'
        return ''
      case 'password':
        return getPasswordError(value)
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
    if (!formData.email.trim() || !formData.password) return false
    if (!EMAIL_REGEX.test(formData.email)) return false
    if (getPasswordError(formData.password)) return false
    return true
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const nextFormData = { ...formData, [name]: value }
    setFormData(nextFormData)
    if (touched[name]) {
      const err = validateField(name, value)
      setErrors((prev) => ({ ...prev, [name]: err }))
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, formData[name]) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setTouched({ email: true, password: true })
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const fullName = deriveFullNameFromEmail(formData.email)
      const user = await registerUser({
        fullName,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      })
      navigate('/account-created', { state: { walletAddress: user?.walletAddress } })
    } catch (err) {
      setSubmitError(err?.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
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
          <p className="text-gray-500 text-sm mb-6">Set up your account</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {submitError}
              </div>
            )}
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
                  autoComplete="email"
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
                  placeholder="Create a strong master password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f1729]/20 focus:border-[#0f1729] ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>
            <p className="text-xs text-gray-500">
              We create and encrypt your wallet automatically during registration.
            </p>
            <button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className={`w-full py-3 font-medium rounded-lg transition-colors ${isFormValid() && !isSubmitting ? 'bg-[#0f1729] text-white hover:bg-[#1e293b] cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              {isSubmitting ? 'Creating Account...' : 'Continue'}
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
