import { useEffect, useMemo, useState } from 'react'
import { loadAllClaims, updateLocalClaim } from '../../lib/claim-store'
import { approveClaim, rejectClaim } from '../../lib/api'
import { formatCurrency, formatDate, titleCase } from '../../lib/formatters'

const priorityStyles = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-700',
  'not assigned': 'bg-slate-100 text-slate-600',
}

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
}

function normalizePriority(priority) {
  return priority ? String(priority).trim().toLowerCase() : 'not assigned'
}

function formatClaimAmount(amount) {
  if (!amount) {
    return 'Not provided'
  }

  return formatCurrency(amount)
}

export default function AdminClaimsReview() {
  const [claims, setClaims] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedClaimId, setSelectedClaimId] = useState('')
  const [reviewData, setReviewData] = useState({ priority: 'medium', adminNote: '' })
  const [actionError, setActionError] = useState('')

  function refreshClaims() {
    setClaims(loadAllClaims())
  }

  useEffect(() => {
    refreshClaims()
  }, [])

  useEffect(() => {
    function handleStorage(event) {
      if (event.key === 'chainsure.claims') {
        refreshClaims()
      }
    }

    window.addEventListener('storage', handleStorage)

    return () => {
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const selectedClaim = useMemo(
    () => claims.find((claim) => claim.id === selectedClaimId) || null,
    [claims, selectedClaimId],
  )

  const filteredClaims = useMemo(() => {
    if (activeTab === 'pending') {
      return claims.filter((claim) => claim.status === 'pending')
    }

    return claims.filter((claim) => claim.status !== 'pending')
  }, [activeTab, claims])

  const stats = useMemo(() => ({
    total: claims.length,
    pending: claims.filter((claim) => claim.status === 'pending').length,
    resolved: claims.filter((claim) => claim.status === 'approved' || claim.status === 'rejected').length,
  }), [claims])

  function openReview(claim) {
    setActionError('')
    setSelectedClaimId(claim.id)
    setReviewData({
      priority: normalizePriority(claim.priority) === 'not assigned' ? 'medium' : normalizePriority(claim.priority),
      adminNote: claim.adminNote || '',
    })
  }

  function closeReview() {
    setActionError('')
    setSelectedClaimId('')
    setReviewData({ priority: 'medium', adminNote: '' })
  }

  async function persistClaim(status) {
    if (!selectedClaim) {
      return
    }

    try {
      setActionError('')
      if (status === 'approved') {
        await approveClaim(selectedClaim.id)
      } else if (status === 'rejected') {
        await rejectClaim(selectedClaim.id)
      }

      updateLocalClaim(selectedClaim.id, {
        priority: reviewData.priority === 'not assigned' ? '' : reviewData.priority,
        adminNote: reviewData.adminNote,
        ...(status ? { status } : {}),
      })

      refreshClaims()
      closeReview()
    } catch (error) {
      setActionError(error?.message || 'Unable to update claim status right now.')
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Claims Review</h1>
          <p className="mt-1 text-sm text-gray-500">Review and process user claim submissions.</p>
        </div>
        <button
          type="button"
          onClick={refreshClaims}
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">Total claims</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">Pending review</div>
          <div className="mt-2 text-3xl font-semibold text-amber-600">{stats.pending}</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500">Resolved</div>
          <div className="mt-2 text-3xl font-semibold text-emerald-600">{stats.resolved}</div>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`rounded-full px-3 py-1 ${activeTab === 'pending' ? 'bg-[#0f1729] text-white' : 'text-gray-500'}`}
        >
          Pending claims
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reviewed')}
          className={`rounded-full px-3 py-1 ${activeTab === 'reviewed' ? 'bg-[#0f1729] text-white' : 'text-gray-500'}`}
        >
          Reviewed claims
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="hidden grid-cols-8 gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500 md:grid">
          <div>Claim</div>
          <div>Owner</div>
          <div>Policy</div>
          <div>Type</div>
          <div>Amount</div>
          <div>Status</div>
          <div>Priority</div>
          <div>Actions</div>
        </div>

        {filteredClaims.length > 0 ? (
          filteredClaims.map((claim) => {
            const priority = normalizePriority(claim.priority)
            const status = claim.status || 'pending'

            return (
              <div key={claim.id} className="grid gap-3 border-b border-gray-100 px-4 py-4 text-sm last:border-0 md:grid-cols-8 md:items-start">
                <div>
                  <div className="font-medium text-gray-900">{claim.claimCode}</div>
                  <div className="text-xs text-gray-500">{formatDate(claim.createdAt)}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{claim.ownerName || 'Unknown user'}</div>
                  <div className="text-xs text-gray-500">{claim.ownerEmail || 'No email'}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{claim.policyName || 'Unnamed policy'}</div>
                  <div className="text-xs text-gray-500">{claim.policyId}</div>
                </div>
                <div className="text-gray-900">{claim.claimType || 'Unavailable'}</div>
                <div className="text-gray-900">{formatClaimAmount(claim.amount)}</div>
                <div>
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusStyles[status] || statusStyles.pending}`}>
                    {titleCase(status)}
                  </span>
                </div>
                <div>
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${priorityStyles[priority] || priorityStyles['not assigned']}`}>
                    {titleCase(priority)}
                  </span>
                </div>
                <div>
                  <button type="button" onClick={() => openReview(claim)} className="font-medium text-[#0f1729] hover:underline">
                    Review
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="px-4 py-10 text-sm text-gray-500">
            {activeTab === 'pending'
              ? 'No pending claims are currently available.'
              : 'No reviewed claims have been recorded yet.'}
          </div>
        )}
      </div>

      {selectedClaim ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Review Claim {selectedClaim.claimCode}</h2>
                <p className="text-sm text-gray-500">{selectedClaim.ownerName || selectedClaim.ownerEmail}</p>
              </div>
              <button type="button" onClick={closeReview} className="text-2xl leading-none text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="text-xs text-gray-500">Policy</div>
                <div className="font-medium text-gray-900">{selectedClaim.policyName}</div>
                <div className="text-xs text-gray-500">{selectedClaim.policyId}</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="text-xs text-gray-500">Incident Date</div>
                <div className="font-medium text-gray-900">{formatDate(selectedClaim.incidentDate)}</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="text-xs text-gray-500">Amount</div>
                <div className="font-medium text-gray-900">{formatClaimAmount(selectedClaim.amount)}</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="text-xs text-gray-500">Attachments</div>
                <div className="font-medium text-gray-900">{selectedClaim.attachments?.length || 0} file names stored</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-1 text-xs text-gray-500">Description</div>
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{selectedClaim.description || 'No description provided.'}</div>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs text-gray-500" htmlFor="claim-priority">Priority</label>
                <select
                  id="claim-priority"
                  value={reviewData.priority}
                  onChange={(event) => setReviewData((current) => ({ ...current, priority: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="not assigned">Not assigned</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500" htmlFor="claim-status">Current Status</label>
                <div id="claim-status" className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  {titleCase(selectedClaim.status || 'pending')}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs text-gray-500" htmlFor="claim-note">Admin Note</label>
              <textarea
                id="claim-note"
                value={reviewData.adminNote}
                onChange={(event) => setReviewData((current) => ({ ...current, adminNote: event.target.value }))}
                className="mt-1 min-h-[100px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Record what was reviewed, what evidence is missing, or why the claim was accepted or rejected."
              />
            </div>

            {actionError ? (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {actionError}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button type="button" onClick={closeReview} className="rounded-lg border border-gray-200 px-4 py-2 text-sm">
                Cancel
              </button>
              <button type="button" onClick={() => persistClaim()} className="rounded-lg bg-gray-100 px-4 py-2 text-sm">
                Save
              </button>
              <button type="button" onClick={() => persistClaim('rejected')} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                Reject Claim
              </button>
              <button type="button" onClick={() => persistClaim('approved')} className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                Approve Claim
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
