import { Link } from 'react-router-dom'

export default function ForgotPassword() {
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
          <h1 className="text-2xl font-bold text-[#0f1729] mb-1">Forgot Password</h1>
          <p className="text-gray-500 text-sm mb-6">Password reset is not available yet.</p>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              Please contact support if you need help accessing your account.
            </div>
            <Link to="/signin" className="block w-full py-3 bg-[#0f1729] text-white font-medium rounded-lg hover:bg-[#1e293b] transition-colors text-center">
              Return to Sign In
            </Link>
          </div>
          <p className="mt-6 text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link to="/signin" className="text-[#0f1729] font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
