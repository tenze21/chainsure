import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchAllPolicies, revokePolicy } from '../../lib/adminApi'
import { formatDate, titleCase } from '../../lib/formatters'

const REVOCATION_NOTE_MIN_LENGTH = 50

const statusStyles = {
  active: 'bg-green-50 text-green-700 border border-green-200',
  payment_confirmed: 'bg-green-50 text-green-700 border border-green-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  claimed: 'bg-slate-50 text-slate-700 border border-slate-200',
  expired: 'bg-gray-50 text-gray-600 border border-gray-200',
  cancelled: 'bg-gray-50 text-gray-600 border border-gray-200',
  invalidated: 'bg-red-50 text-red-600 border border-red-200',
}

function formatWallet(value) {
  if (!value) {
    return '—'
  }

  const text = String(value)
  if (text.length <= 14) {
    return text
  }

  return `${text.slice(0, 8)}...${text.slice(-4)}`
}

function formatPolicyStatus(status) {
  if (status === 'invalidated') {
    return 'Revoked'
  }

  return titleCase(String(status || 'pending').replace(/_/g, ' '))
}

function toRevocationPolicyViewModel(policy) {
  if (!policy) {
    return null
  }

  const tokenId = policy.tokenId != null && policy.tokenId !== ''
    ? String(policy.tokenId)
    : ''
  const status = policy.status || 'pending'

  return {
    id: policy.id,
    tokenId,
    tokenDisplay: tokenId ? `#${tokenId}` : 'Not minted',
    owner: policy.holderName || 'Unknown',
    ownerEmail: policy.holderEmail || '',
    type: policy.name || policy.category || 'Policy',
    wallet: formatWallet(policy.contractAddress || policy.holderCid),
    minted: policy.createdAt,
    status,
    statusLabel: formatPolicyStatus(status),
    revocationNote: policy.revocationNote || '',
    canRevoke: status !== 'invalidated' && Boolean(tokenId),
  }
}

export default function AdminRevocation() {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedPolicy, setSelectedPolicy] = useState(null)
  const [notes, setNotes] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadPolicies = useCallback(async ({ forceRefresh = false } = {}) => {
    setLoading(true)

    try {
      const items = await fetchAllPolicies({ forceRefresh })
      setPolicies(
        (Array.isArray(items) ? items : [])
          .map((policy) => toRevocationPolicyViewModel(policy))
          .filter(Boolean),
      )
      setLoadError('')
    } catch (error) {
      setPolicies([])
      setLoadError(error?.message || 'Failed to load policies.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPolicies()
  }, [loadPolicies])

  const filteredPolicies = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) {
      return policies
    }

    return policies.filter((policy) => (
      policy.owner.toLowerCase().includes(query)
      || policy.ownerEmail.toLowerCase().includes(query)
      || policy.type.toLowerCase().includes(query)
      || policy.id.toLowerCase().includes(query)
      || policy.tokenId.toLowerCase().includes(query)
      || policy.tokenDisplay.toLowerCase().includes(query)
    ))
  }, [policies, search])

  const revocableCount = useMemo(
    () => policies.filter((policy) => policy.canRevoke).length,
    [policies],
  )

  const noteLength = notes.trim().length
  const noteIsValid = noteLength >= REVOCATION_NOTE_MIN_LENGTH

  const closeModal = () => {
    setSelectedPolicy(null)
    setNotes('')
    setActionError('')
  }

  const confirmRevoke = async () => {
    if (!selectedPolicy?.id) {
      return
    }

    if (!noteIsValid) {
      setActionError(`Revocation reason must be at least ${REVOCATION_NOTE_MIN_LENGTH} characters.`)
      return
    }

    setActionLoading(true)
    setActionError('')
    setActionMessage('')

    try {
      await revokePolicy(selectedPolicy.id, {
        revocationNote: notes.trim(),
      })
      await loadPolicies({ forceRefresh: true })
      setActionMessage(`Policy ${selectedPolicy.tokenDisplay} was revoked successfully.`)
      closeModal()
    } catch (error) {
      setActionError(error?.message || 'Failed to revoke policy.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Policy Revocation</h1>
        <p className="text-gray-500 text-sm mt-1">Deactivate policies for fraud or dispute cases.</p>
      </div>

      {loadError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {loadError}
        </div>
      )}

      {actionMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {actionMessage}
        </div>
      )}

      <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
        {loading
          ? 'Loading policies...'
          : `${revocableCount} polic${revocableCount === 1 ? 'y is' : 'ies are'} eligible for on-chain revocation. Policies without a minted token ID cannot be revoked yet.`}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by policyholder, policy type, or token ID"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <button
            type="button"
            onClick={() => loadPolicies({ forceRefresh: true })}
            disabled={loading}
            className="px-4 py-2 bg-[#0f1729] text-white rounded-lg text-sm disabled:opacity-60"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 text-xs text-gray-500 px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div>Token ID</div>
          <div>Policyholder</div>
          <div>Policy Type</div>
          <div>Wallet / CID</div>
          <div>Minted</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {loading ? (
          <div className="px-4 py-8 text-sm text-gray-500">Loading policies...</div>
        ) : filteredPolicies.length === 0 ? (
          <div className="px-4 py-8 text-sm text-gray-500">
            {policies.length === 0 ? 'No policies are available for revocation.' : 'No policies match your search.'}
          </div>
        ) : (
          filteredPolicies.map((policy) => (
            <div key={policy.id} className="grid grid-cols-7 text-sm px-4 py-3 border-b border-gray-100 last:border-0 items-center">
              <div className="font-medium text-gray-900 break-all pr-2">{policy.tokenDisplay}</div>
              <div>
                <div className="font-medium text-gray-900">{policy.owner}</div>
                {policy.ownerEmail ? (
                  <div className="text-xs text-gray-500 mt-0.5">{policy.ownerEmail}</div>
                ) : null}
              </div>
              <div>{policy.type}</div>
              <div className="text-gray-500 break-all pr-2" title={policy.wallet}>{policy.wallet}</div>
              <div className="text-gray-500">{formatDate(policy.minted)}</div>
              <div>
                <span className={`px-2 py-1 rounded-full text-xs ${statusStyles[policy.status] || statusStyles.pending}`}>
                  {policy.statusLabel}
                </span>
              </div>
              <div>
                {policy.canRevoke ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPolicy(policy)
                      setNotes('')
                      setActionError('')
                    }}
                    className="px-3 py-1 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    Revoke
                  </button>
                ) : (
                  <span className="text-xs text-gray-400">
                    {policy.status === 'invalidated' ? 'Revoked' : 'Unavailable'}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedPolicy && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Revoke Policy {selectedPolicy.tokenDisplay}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                disabled={actionLoading}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="mb-4 text-sm text-gray-600">
              <div><span className="font-medium text-gray-900">Policyholder:</span> {selectedPolicy.owner}</div>
              <div className="mt-1"><span className="font-medium text-gray-900">Type:</span> {selectedPolicy.type}</div>
            </div>

            <label className="block text-xs text-gray-500 mb-1" htmlFor="revocation-note">
              Revocation reason (minimum {REVOCATION_NOTE_MIN_LENGTH} characters)
            </label>
            <textarea
              id="revocation-note"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              disabled={actionLoading}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="Provide a detailed revocation reason for audit records"
            />
            <div className={`mt-1 text-xs ${noteIsValid ? 'text-green-600' : 'text-gray-500'}`}>
              {noteLength}/{REVOCATION_NOTE_MIN_LENGTH} characters
            </div>

            {actionError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {actionError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={closeModal}
                disabled={actionLoading}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRevoke}
                disabled={actionLoading || !noteIsValid}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg disabled:opacity-60"
              >
                {actionLoading ? 'Revoking...' : 'Revoke Policy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
