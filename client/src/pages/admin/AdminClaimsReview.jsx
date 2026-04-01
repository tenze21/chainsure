import { useMemo, useState } from 'react'

const initialClaims = [
  {
    id: 'CLM-024',
    policyholder: 'Tenzin Choda',
    email: 'tenzin@example.com',
    policy: 'Travel Insurance #1042',
    type: 'Medical Expense',
    amount: 'Nu. 85,000',
    priority: 'Medium',
    status: 'pending',
    description: 'Hospitalization during trip to Thailand. Medical bills and pharmacy costs.',
  },
  {
    id: 'CLM-023',
    policyholder: 'Karma Dorji',
    email: 'karma@example.com',
    policy: 'Motor Insurance #1038',
    type: 'Accident',
    amount: 'Nu. 150,000',
    priority: 'Low',
    status: 'pending',
    description: 'Minor collision. Repairs and towing expenses.',
  },
  {
    id: 'CLM-022',
    policyholder: 'Pema Lhamo',
    email: 'pema@example.com',
    policy: 'Travel Insurance #1035',
    type: 'Trip Cancellation',
    amount: 'Nu. 25,000',
    priority: 'Medium',
    status: 'pending',
    description: 'Trip cancelled due to medical emergency.',
  },
]

const priorityColors = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low: 'bg-gray-100 text-gray-700',
  'Not assigned': 'bg-slate-100 text-slate-600',
}

export default function AdminClaimsReview() {
  const [claims, setClaims] = useState(initialClaims)
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [reviewData, setReviewData] = useState({ priority: 'Medium', notes: '' })

  const filteredClaims = useMemo(() => {
    if (activeTab === 'pending') {
      return claims.filter((claim) => claim.status === 'pending')
    }

    return claims.filter((claim) => claim.status !== 'pending')
  }, [activeTab, claims])

  const openReview = (claim) => {
    setSelectedClaim(claim)
    setReviewData({ priority: claim.priority, notes: claim.notes || '' })
  }

  const closeReview = () => {
    setSelectedClaim(null)
    setReviewData({ priority: 'Medium', notes: '' })
  }

  const updateClaim = (updates) => {
    setClaims((previous) => previous.map((claim) => (
      claim.id === selectedClaim.id ? { ...claim, ...updates } : claim
    )))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Claims Review</h1>
        <p className="text-gray-500 text-sm mt-1">Review and process insurance claims from policyholders.</p>
      </div>

      <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
        Claims endpoints are not available in the backend yet. Showing sample data until those APIs exist.
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm">
        <button onClick={() => setActiveTab('pending')} className={`px-3 py-1 rounded-full ${activeTab === 'pending' ? 'bg-[#0f1729] text-white' : 'text-gray-500'}`}>
          Pending claims
        </button>
        <button onClick={() => setActiveTab('covered')} className={`px-3 py-1 rounded-full ${activeTab === 'covered' ? 'bg-[#0f1729] text-white' : 'text-gray-500'}`}>
          Reviewed claims
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 text-xs text-gray-500 px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div>Claim ID</div>
          <div>Policyholder</div>
          <div>Policy</div>
          <div>Type</div>
          <div>Amount</div>
          <div>Priority</div>
          <div>Actions</div>
        </div>
        {filteredClaims.map((claim) => (
          <div key={claim.id} className="grid grid-cols-7 text-sm px-4 py-3 border-b border-gray-100 last:border-0">
            <div className="font-medium text-gray-900">{claim.id}</div>
            <div>
              <div className="font-medium text-gray-900">{claim.policyholder}</div>
              <div className="text-xs text-gray-500">{claim.email}</div>
            </div>
            <div className="text-gray-900">{claim.policy}</div>
            <div className="text-gray-900">{claim.type}</div>
            <div className="text-gray-900">{claim.amount}</div>
            <div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[claim.priority] || 'bg-gray-100 text-gray-600'}`}>
                {claim.priority}
              </span>
            </div>
            <div>
              <button onClick={() => openReview(claim)} className="text-[#0f1729] hover:underline">
                Review
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedClaim && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Review Claim {selectedClaim.id}</h2>
                <p className="text-sm text-gray-500">{selectedClaim.policyholder}</p>
              </div>
              <button onClick={closeReview} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">Policy</div>
                <div className="font-medium text-gray-900">{selectedClaim.policy}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500">Claim Type</div>
                <div className="font-medium text-gray-900">{selectedClaim.type}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-1">Description</div>
              <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedClaim.description}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-500">Priority</label>
                <select
                  value={reviewData.priority}
                  onChange={(event) => setReviewData((previous) => ({ ...previous, priority: event.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                  <option>Not assigned</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Admin Notes</label>
                <input
                  value={reviewData.notes}
                  onChange={(event) => setReviewData((previous) => ({ ...previous, notes: event.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button onClick={closeReview} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">
                Cancel
              </button>
              <button onClick={() => { updateClaim({ priority: reviewData.priority, notes: reviewData.notes }); closeReview() }} className="px-4 py-2 text-sm bg-gray-100 rounded-lg">
                Save
              </button>
              <button onClick={() => { updateClaim({ status: 'denied', priority: reviewData.priority, notes: reviewData.notes }); closeReview() }} className="px-4 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg">
                Deny Claim
              </button>
              <button onClick={() => { updateClaim({ status: 'approved', priority: reviewData.priority, notes: reviewData.notes }); closeReview() }} className="px-4 py-2 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg">
                Approve Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
