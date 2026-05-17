import { useCallback, useEffect, useMemo, useState } from 'react'
import { approveClaim, getClaims, rejectClaim } from '../../lib/api'
import { formatDate, titleCase } from '../../lib/formatters'

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

const PRIORITY_OPTIONS = ['high', 'medium', 'low']

function normalizePriority(priority) {
  const value = priority ? String(priority).trim().toLowerCase() : ''
  return PRIORITY_OPTIONS.includes(value) ? value : 'medium'
}

function getReviewDefaults(claim) {
  return {
    priority: normalizePriority(claim?.priority),
    adminNote: claim?.adminNote || '',
  }
}

function formatClaimCode(id) {
  const cleanId = String(id || '').replace(/-/g, '').slice(-6).toUpperCase()
  if (!cleanId) {
    return 'CLM-PENDING'
  }
  return `CLM-${cleanId}`
}

function toAdminClaimViewModel(claim) {
  if (!claim) {
    return null
  }

  const policy = claim.policy || claim.Policy || null
  const user = claim.user || claim.User || null

  const ownerName = user?.fullName
    || user?.full_name
    || policy?.holderName
    || ''
  const ownerEmail = user?.email || policy?.holderEmail || ''
  const policyName = policy?.name || policy?.category || ''

  return {
    id: claim.id,
    claimCode: formatClaimCode(claim.id),
    userId: claim.userId || user?.id || '',
    ownerName,
    ownerEmail,
    policyId: claim.policyId || policy?.id || '',
    policyName,
    policyCategory: policy?.category || '',
    description: claim.description || '',
    status: claim.status || 'pending',
    priority: claim.priority || '',
    adminNote: claim.adminNote || '',
    createdAt: claim.createdAt || '',
    updatedAt: claim.updatedAt || '',
  }
}

export default function AdminClaimsReview() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedClaimId, setSelectedClaimId] = useState('')
  const [reviewData, setReviewData] = useState({ priority: 'medium', adminNote: '' })
  const [actionError, setActionError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadClaims = useCallback(async ({ forceRefresh = false } = {}) => {
    setLoading(true)

    try {
      const response = await getClaims({ forceRefresh })
      const rawClaims = Array.isArray(response?.data?.claims) ? response.data.claims : []
      setClaims(
        rawClaims
          .map((claim) => toAdminClaimViewModel(claim))
          .filter(Boolean),
      )
      setLoadError('')
    } catch (error) {
      setClaims([])
      setLoadError(error.message || 'Failed to load claims.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClaims()
  }, [loadClaims])

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
    setReviewData(getReviewDefaults(claim))
  }

  function closeReview() {
    setActionError('')
    setSelectedClaimId('')
    setReviewData({ priority: 'medium', adminNote: '' })
  }

  function buildReviewPayload() {
    return {
      priority: reviewData.priority,
      adminNote: reviewData.adminNote.trim(),
    }
  }

  async function persistClaim(status) {
    if (!selectedClaim || !status) {
      return
    }

    try {
      setActionLoading(true)
      setActionError('')

      const reviewPayload = buildReviewPayload()

      if (status === 'approved') {
        await approveClaim(selectedClaim.id, reviewPayload)
      } else if (status === 'rejected') {
        await rejectClaim(selectedClaim.id, reviewPayload)
      }

      await loadClaims({ forceRefresh: true })
      closeReview()
    } catch (error) {
      setActionError(error?.message || 'Unable to update claim status right now.')
    } finally {
      setActionLoading(false)
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
          onClick={() => loadClaims({ forceRefresh: true })}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
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

      {loadError ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadError}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="hidden grid-cols-6 gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 md:grid md:items-center">
          <div>Claim</div>
          <div>User</div>
          <div>Policy</div>
          <div>Status</div>
          <div>Priority</div>
          <div className="text-right">Actions</div>
        </div>

        {loading ? (
          <div className="px-4 py-10 text-sm text-gray-500">Loading claims...</div>
        ) : filteredClaims.length > 0 ? (
          filteredClaims.map((claim) => {
            const priority = claim.priority
              ? normalizePriority(claim.priority)
              : 'not assigned'
            const status = claim.status || 'pending'

            return (
              <div key={claim.id} className="grid gap-4 border-b border-gray-100 px-4 py-4 text-sm last:border-0 md:grid-cols-6 md:items-center">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900">{claim.claimCode}</div>
                  <div className="text-xs text-gray-500">{formatDate(claim.createdAt)}</div>
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium text-gray-900">
                    {claim.ownerName || claim.ownerEmail || 'Unknown user'}
                  </div>
                  <div className="truncate text-xs text-gray-500">{claim.ownerEmail || claim.userId || 'No email'}</div>
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium text-gray-900">
                    {claim.policyName || 'Unnamed policy'}
                  </div>
                  <div className="truncate text-xs text-gray-500">
                    {claim.policyCategory ? `${claim.policyCategory} · ` : ''}{claim.policyId}
                  </div>
                </div>
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
                <div className="md:text-right">
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
                <p className="text-sm text-gray-500">
                  {selectedClaim.ownerName || selectedClaim.ownerEmail || selectedClaim.userId}
                </p>
              </div>
              <button type="button" onClick={closeReview} className="text-2xl leading-none text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>

            <div className="mb-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="text-xs text-gray-500">Policy</div>
                <div className="font-medium text-gray-900">{selectedClaim.policyName || 'Unnamed policy'}</div>
                <div className="text-xs text-gray-500">
                  {selectedClaim.policyCategory ? `${selectedClaim.policyCategory} · ` : ''}
                  {selectedClaim.policyId}
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="text-xs text-gray-500">Submitted</div>
                <div className="font-medium text-gray-900">{formatDate(selectedClaim.createdAt)}</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="text-xs text-gray-500">Status</div>
                <div className="font-medium text-gray-900">{titleCase(selectedClaim.status || 'pending')}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-1 text-xs text-gray-500">Description</div>
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                {selectedClaim.description || 'No description provided.'}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500" htmlFor="claim-priority">
                Priority
              </label>
              <select
                id="claim-priority"
                value={reviewData.priority}
                onChange={(event) => setReviewData((current) => ({
                  ...current,
                  priority: event.target.value,
                }))}
                disabled={selectedClaim.status !== 'pending' || actionLoading}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-gray-50"
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {titleCase(option)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="text-xs text-gray-500" htmlFor="claim-note">
                Admin Note
              </label>
              <textarea
                id="claim-note"
                value={reviewData.adminNote}
                onChange={(event) => setReviewData((current) => ({
                  ...current,
                  adminNote: event.target.value,
                }))}
                disabled={selectedClaim.status !== 'pending' || actionLoading}
                className="mt-1 min-h-[100px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-gray-50"
                placeholder="Record what was reviewed, what evidence is missing, or why the claim was accepted or rejected."
              />
            </div>

            {actionError ? (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {actionError}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeReview}
                disabled={actionLoading}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm"
              >
                Cancel
              </button>
              {selectedClaim.status === 'pending' ? (
                <>
                  <button
                    type="button"
                    onClick={() => persistClaim('rejected')}
                    disabled={actionLoading}
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 disabled:opacity-60"
                  >
                    Reject Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => persistClaim('approved')}
                    disabled={actionLoading}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 disabled:opacity-60"
                  >
                    Approve Claim
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
