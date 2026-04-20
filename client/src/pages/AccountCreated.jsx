import { Link, useLocation } from 'react-router-dom'

export default function AccountCreated() {
  const location = useLocation()
  const walletAddress = location.state?.walletAddress || '0x7b2b...Cbe'

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
          <p className="text-gray-500 text-sm mb-6">Secure your wallet</p>

          {/* Progress Stepper */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <span className="text-xs text-gray-500 mt-1">Profile</span>
            </div>
            <div className="w-12 h-0.5 bg-teal-500" />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              </div>
              <span className="text-xs text-gray-500 mt-1">Wallet</span>
            </div>
            <div className="w-12 h-0.5 bg-[#0f1729]" />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-[#0f1729] flex items-center justify-center text-white font-semibold text-sm">3</div>
              <span className="text-xs text-gray-500 mt-1">Done</span>
            </div>
          </div>

          {/* Success Illustration */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#0f1729] text-center mb-2">Account Created!</h2>
          <p className="text-gray-500 text-sm text-center mb-6">
            Your wallet has been assigned and created securely. You can now browse and purchase insurance policies.
          </p>
          <div className="mb-6">
            <label className="block text-sm text-gray-500 mb-1">Wallet Address</label>
            <div className="px-4 py-3 bg-gray-100 rounded-lg text-gray-700 font-mono text-sm">
              {walletAddress}
            </div>
          </div>
          <Link to="/dashboard" className="block w-full py-3 bg-[#0f1729] text-white font-medium rounded-lg hover:bg-[#1e293b] transition-colors text-center">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
