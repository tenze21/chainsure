import { useEffect, useMemo, useState } from 'react'
import { createPolicyFromProposal, fetchAdminProposals, rejectProposal } from '../../lib/adminApi'
import { attachTrackedPolicyToProposal, buildProposalSignature, loadTrackedProposals, updateTrackedProposalStatus } from '../../lib/proposal-store'

function formatDate(value) {
  if (!value) {
    return '--'
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '--' : date.toLocaleDateString()
}

function formatStatus(status) {
  if (!status) {
    return 'Pending'
  }

  return status.charAt(0).toUpperCase() + status.slice(1)
}

function formatAttributeLabel(key) {
  return String(key || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (character) => character.toUpperCase())
}

function buildActionableApplications(applications) {
  const trackedBySignature = new Map(
    loadTrackedProposals().map((proposal) => [buildProposalSignature(proposal), proposal]),
  )

  return applications.map((application, index) => {
    const trackedProposal = trackedBySignature.get(buildProposalSignature(application)) || null

    return {
      ...application,
      key: trackedProposal?.id || `${application.name}-${application.createdAt}-${index}`,
      trackedProposal,
      proposalId: trackedProposal?.id || null,
      attributes: trackedProposal?.attributes || {},
      ownerEmail: trackedProposal?.ownerEmail || '',
      isActionable: Boolean(trackedProposal?.id),
    }
  })
}

export default function AdminPolicyProposals() {
  const [applications, setApplications] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [premium, setPremium] = useState('')
  const [deductable, setDeductable] = useState('')

  async function loadApplications() {
    const items = await fetchAdminProposals()
    const mergedItems = buildActionableApplications(items)

    setApplications(mergedItems)
    setSelectedIndex((previous) => {
      if (!mergedItems.length) {
        return 0
      }

      return previous >= mergedItems.length ? 0 : previous
    })
  }

  useEffect(() => {
    let active = true

    loadApplications()
      .catch((loadError) => {
        if (active) {
          setError(loadError?.message || 'Failed to load proposals.')
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const selectedApplication = applications[selectedIndex] || null
  const pendingCount = applications.filter((app) => app.status === 'pending').length
  const actionableCount = applications.filter((app) => app.isActionable && app.status === 'pending').length

  useEffect(() => {
    setActionError('')
    setActionMessage('')
    setPremium('')
    setDeductable('')
  }, [selectedApplication?.key])

  const statusClassName = useMemo(() => (
    selectedApplication?.status === 'approved'
      ? 'bg-green-50 text-green-700'
      : selectedApplication?.status === 'rejected'
        ? 'bg-red-50 text-red-600'
        : 'bg-amber-50 text-amber-700'
  ), [selectedApplication])

  async function handleReject() {
    if (!selectedApplication?.proposalId) {
      return
    }

    setActionLoading(true)
    setActionError('')
    setActionMessage('')

    try {
      await rejectProposal(selectedApplication.proposalId)
      updateTrackedProposalStatus({ id: selectedApplication.proposalId, status: 'rejected' })
      await loadApplications()
      setActionMessage('Proposal rejected successfully.')
    } catch (rejectError) {
      setActionError(rejectError?.message || 'Failed to reject proposal.')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleApproveAndMint() {
    if (!selectedApplication?.proposalId) {
      return
    }

    const premiumValue = Number(premium)
    const deductableValue = Number(deductable)

    if (!Number.isFinite(premiumValue) || premiumValue <= 0) {
      setActionError('Enter a valid premium amount.')
      return
    }

    if (!Number.isFinite(deductableValue) || deductableValue <= 0) {
      setActionError('Enter a valid deductible amount.')
      return
    }

    setActionLoading(true)
    setActionError('')
    setActionMessage('')

    try {
      const response = await createPolicyFromProposal(selectedApplication.proposalId, {
        premium: premiumValue,
        deductable: deductableValue,
      })
      const createdPolicy = response?.data || null

      attachTrackedPolicyToProposal({
        proposalId: selectedApplication.proposalId,
        policyId: createdPolicy?.id,
        policyStatus: createdPolicy?.status,
      })

      updateTrackedProposalStatus({ id: selectedApplication.proposalId, status: 'approved' })
      await loadApplications()
      setActionMessage(
        createdPolicy?.id
          ? `Policy created successfully. Policy ID ${createdPolicy.id} is ready for payment.`
          : 'Policy created and proposal approved successfully.',
      )
    } catch (approveError) {
      setActionError(approveError?.message || 'Failed to approve and mint policy.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Policy Proposals</h1>
          <p className="text-gray-500 text-sm mt-1">Review submitted policy applications.</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
          {pendingCount} Pending Review
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
        {actionableCount > 0
          ? `${actionableCount} pending proposal${actionableCount === 1 ? ' is' : 's are'} ready for admin action. Some older records may remain read-only.`
          : 'Admin actions are available only for proposals with complete review details.'}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="space-y-3">
          {loading ? (
            <div className="text-sm text-gray-500">Loading proposals...</div>
          ) : applications.length === 0 ? (
            <div className="text-sm text-gray-500">No proposals have been submitted yet.</div>
          ) : (
            applications.map((application, index) => (
              <button
                key={application.key}
                onClick={() => setSelectedIndex(index)}
                className={`w-full text-left p-4 rounded-xl border transition ${selectedIndex === index ? 'border-[#0f1729] shadow-sm bg-white' : 'border-gray-200 bg-white'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-gray-900">{application.name || 'Unknown Proposal'}</div>
                  <span className={`px-2 py-1 text-xs rounded-full ${application.status === 'approved' ? 'bg-green-50 text-green-700' : application.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                    {formatStatus(application.status)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{formatDate(application.createdAt)}</div>
                <div className="text-sm text-gray-600 mt-2">{application.category || 'General'}</div>
                <div className={`mt-3 inline-flex px-2 py-1 text-xs rounded-full ${application.isActionable ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>
                  {application.isActionable ? 'Actionable' : 'Read-only'}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 min-h-[360px]">
          {selectedApplication ? (
            <div>
              <div className="flex items-start justify-between mb-4 gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selectedApplication.name || 'Unknown Proposal'}</h2>
                  <p className="text-sm text-gray-500">{selectedApplication.category || 'General'}</p>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full ${statusClassName}`}>
                  {formatStatus(selectedApplication.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Submitted</div>
                  <div className="font-medium text-gray-900">{formatDate(selectedApplication.createdAt)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Category</div>
                  <div className="font-medium text-gray-900">{selectedApplication.category || 'General'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Proposal ID</div>
                  <div className="font-medium text-gray-900 break-all">{selectedApplication.proposalId || 'Unavailable'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">Review State</div>
                  <div className="font-medium text-gray-900">{selectedApplication.isActionable ? 'Ready for action' : 'Summary only'}</div>
                </div>
              </div>

              {selectedApplication.isActionable && Object.keys(selectedApplication.attributes).length > 0 && (
                <div className="mb-6">
                  <div className="text-xs text-gray-500 mb-2">Submitted Attributes</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(selectedApplication.attributes).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-lg p-3 text-sm">
                        <div className="text-xs text-gray-500">{formatAttributeLabel(key)}</div>
                        <div className="font-medium text-gray-900 mt-1 break-words">{value || 'Not provided'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!selectedApplication.isActionable && (
                <div className="mb-6">
                  <div className="text-xs text-gray-500 mb-1">Review Status</div>
                  <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                    This proposal is read-only because complete review details are not available.
                  </div>
                </div>
              )}

              {actionError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {actionError}
                </div>
              )}

              {actionMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  {actionMessage}
                </div>
              )}

              {selectedApplication.isActionable && selectedApplication.status === 'pending' && (
                <div className="mb-6">
                  <div className="text-xs text-gray-500 mb-2">Policy Drafting Inputs</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Premium</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={premium}
                        onChange={(event) => setPremium(event.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="Enter premium amount"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Deductible</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={deductable}
                        onChange={(event) => setDeductable(event.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="Enter deductible amount"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  disabled={actionLoading || !selectedApplication.isActionable || selectedApplication.status !== 'pending'}
                  onClick={handleReject}
                  className={`px-4 py-2 text-sm rounded-lg ${actionLoading || !selectedApplication.isActionable || selectedApplication.status !== 'pending' ? 'border border-red-200 text-red-300 cursor-not-allowed' : 'border border-red-200 text-red-600 hover:bg-red-50'}`}
                >
                  {actionLoading ? 'Working...' : 'Reject'}
                </button>
                <button
                  disabled={actionLoading || !selectedApplication.isActionable || selectedApplication.status !== 'pending'}
                  onClick={handleApproveAndMint}
                  className={`px-4 py-2 text-sm rounded-lg ${actionLoading || !selectedApplication.isActionable || selectedApplication.status !== 'pending' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#0f1729] text-white hover:bg-[#1e293b]'}`}
                >
                  {actionLoading ? 'Working...' : 'Approve & Mint'}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="font-medium">Select a Proposal</div>
              <div className="text-sm">Choose a proposal from the list to view its summary.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
