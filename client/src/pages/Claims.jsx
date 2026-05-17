import { useCallback, useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { getUserClaims, submitClaim } from '../lib/api'
import { formatDate, titleCase } from '../lib/formatters'
import {
  loadCachedUserClaims,
  mergeClaimsById,
  saveCachedUserClaims,
  upsertCachedUserClaim,
} from '../lib/user-claims-cache'
import './Claims.css'

const CLAIM_READY_STATUSES = new Set(['payment_confirmed', 'active'])

const DocumentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
)

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
)

function formatClaimStatus(status) {
  if (status === 'approved') {
    return 'Approved'
  }

  if (status === 'rejected' || status === 'denied') {
    return 'Rejected'
  }

  return 'In review'
}

function getStatusBadgeClass(status) {
  if (status === 'approved') {
    return 'status-badge status-badge--approved'
  }

  if (status === 'rejected' || status === 'denied') {
    return 'status-badge status-badge--denied'
  }

  return 'status-badge status-badge--review'
}

function normalizeEligiblePolicies(proposals) {
  return [...(Array.isArray(proposals) ? proposals : [])]
    .filter((proposal) => (
      proposal?.policyId
      && (proposal?.status === 'approved' || CLAIM_READY_STATUSES.has(proposal?.policyStatus))
    ))
    .map((proposal) => ({
      key: proposal.key || proposal.policyId,
      policyId: proposal.policyId,
      policyName: proposal.name || 'Unnamed policy',
      policyCategory: proposal.category || 'Uncategorized',
      policyStatus: proposal.policyStatus || proposal.status || '',
      createdAt: proposal.createdAt || '',
    }))
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
}

function getDefaultFormState(policyId = '') {
  return {
    policyId,
    incidentDate: '',
    description: '',
  }
}

function formatClaimCode(id) {
  const cleanId = String(id || '').replace(/-/g, '').slice(-6).toUpperCase()
  if (!cleanId) {
    return 'CLM-PENDING'
  }
  return `CLM-${cleanId}`
}

function parseClaimsFromResponse(response) {
  const claims = response?.data?.claims

  if (Array.isArray(claims)) {
    return { claims, hasInvalidPayload: false }
  }

  const hasInvalidPayload = claims != null && typeof claims === 'object'
  return { claims: [], hasInvalidPayload }
}

function toClaimViewModel(claim, policyLookup = new Map(), extra = {}) {
  if (!claim) {
    return null
  }

  const linkedPolicy = claim.policy || policyLookup.get(claim.policyId) || null

  return {
    id: claim.id,
    claimCode: claim.claimCode || formatClaimCode(claim.id),
    policyId: claim.policyId || linkedPolicy?.policyId || extra.policyId || '',
    policyName: linkedPolicy?.name || linkedPolicy?.policyName || extra.policyName || 'Issued policy',
    policyCategory: linkedPolicy?.category || linkedPolicy?.policyCategory || extra.policyCategory || '',
    incidentDate: extra.incidentDate || claim.incidentDate || '',
    description: claim.description || extra.description || '',
    status: claim.status || 'pending',
    priority: claim.priority || '',
    adminNote: claim.adminNote || '',
    createdAt: claim.createdAt || new Date().toISOString(),
    updatedAt: claim.updatedAt || new Date().toISOString(),
  }
}

export default function Claims({
  onNavigate,
  onSignOut,
  user,
  currentPageLabel,
  proposals = [],
}) {
  const [rawClaims, setRawClaims] = useState([])
  const [claimsLoading, setClaimsLoading] = useState(true)
  const [claimsError, setClaimsError] = useState('')
  const [selectedClaimId, setSelectedClaimId] = useState('')
  const [feedback, setFeedback] = useState({ tone: '', message: '' })
  const [formState, setFormState] = useState(() => getDefaultFormState())

  const eligiblePolicies = useMemo(
    () => normalizeEligiblePolicies(proposals),
    [proposals],
  )

  const policyLookup = useMemo(
    () => new Map(eligiblePolicies.map((policy) => [policy.policyId, policy])),
    [eligiblePolicies],
  )

  const claims = useMemo(
    () => rawClaims
      .map((claim) => toClaimViewModel(claim, policyLookup))
      .filter(Boolean),
    [rawClaims, policyLookup],
  )

  const claimsByPolicyId = useMemo(
    () => new Map(claims.map((claim) => [claim.policyId, claim])),
    [claims],
  )

  const loadClaims = useCallback(async ({ forceRefresh = false } = {}) => {
    setClaimsLoading(true)

    try {
      const response = await getUserClaims({ forceRefresh })
      const { claims: apiClaims, hasInvalidPayload } = parseClaimsFromResponse(response)
      const cachedClaims = loadCachedUserClaims(user?.id)
      const mergedClaims = apiClaims.length > 0
        ? mergeClaimsById(apiClaims, cachedClaims)
        : cachedClaims

      setRawClaims(mergedClaims)

      if (apiClaims.length > 0) {
        saveCachedUserClaims(user?.id, mergeClaimsById(apiClaims, []))
      }

      if (hasInvalidPayload && mergedClaims.length === 0) {
        setClaimsError('Claims could not be loaded from the server. Try refreshing the page.')
      } else if (hasInvalidPayload && mergedClaims.length > 0) {
        setClaimsError('Showing saved claims from this session. Refresh again after the server responds.')
      } else {
        setClaimsError('')
      }
    } catch (error) {
      const cachedClaims = loadCachedUserClaims(user?.id)
      setRawClaims(cachedClaims)
      setClaimsError(
        cachedClaims.length > 0
          ? 'Could not reach the server. Showing claims saved in this browser session.'
          : error.message || 'Failed to load claims.',
      )
    } finally {
      setClaimsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadClaims({ forceRefresh: true })
  }, [loadClaims])

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        loadClaims({ forceRefresh: true })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [loadClaims])

  const claimablePolicies = useMemo(
    () => eligiblePolicies.filter((policy) => !claimsByPolicyId.has(policy.policyId)),
    [eligiblePolicies, claimsByPolicyId],
  )

  useEffect(() => {
    setFormState((current) => {
      const nextPolicyId = claimablePolicies.some((policy) => policy.policyId === current.policyId)
        ? current.policyId
        : claimablePolicies[0]?.policyId || ''

      if (nextPolicyId === current.policyId) {
        return current
      }

      return {
        ...current,
        policyId: nextPolicyId,
      }
    })
  }, [claimablePolicies])

  const selectedPolicy = useMemo(
    () => claimablePolicies.find((policy) => policy.policyId === formState.policyId) || null,
    [claimablePolicies, formState.policyId],
  )

  const selectedClaim = useMemo(
    () => claims.find((claim) => claim.id === selectedClaimId) || null,
    [claims, selectedClaimId],
  )

  const resolvedClaimsCount = claims.filter((claim) => claim.status === 'approved' || claim.status === 'rejected').length
  const inReviewClaimsCount = claims.filter((claim) => claim.status === 'pending').length

  function resetForm(nextPolicyId = claimablePolicies[0]?.policyId || '') {
    setFormState(getDefaultFormState(nextPolicyId))
  }

  function handleFieldChange(field, value) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFeedback({ tone: '', message: '' })

    if (!selectedPolicy) {
      setFeedback({
        tone: 'error',
        message: 'Select an issued policy before submitting a claim.',
      })
      return
    }

    if (!formState.incidentDate) {
      setFeedback({
        tone: 'error',
        message: 'Incident date is required.',
      })
      return
    }

    if (!formState.description.trim()) {
      setFeedback({
        tone: 'error',
        message: 'Describe what happened so the claim can be reviewed.',
      })
      return
    }

    if (formState.description.trim().length < 50) {
      setFeedback({
        tone: 'error',
        message: 'Claim description must be at least 50 characters.',
      })
      return
    }

    try {
      const response = await submitClaim(selectedPolicy.policyId, {
        description: formState.description.trim(),
      })
      const backendClaim = response?.data?.claim
      const nextClaim = toClaimViewModel(backendClaim, policyLookup, {
        policyId: selectedPolicy.policyId,
        policyName: selectedPolicy.policyName,
        policyCategory: selectedPolicy.policyCategory,
        incidentDate: formState.incidentDate,
        description: formState.description,
      })

      if (nextClaim) {
        setSelectedClaimId(nextClaim.id)
        upsertCachedUserClaim(user?.id, backendClaim || nextClaim)
        setRawClaims((current) => mergeClaimsById([backendClaim || nextClaim], current))
      }

      await loadClaims({ forceRefresh: true })
      setFeedback({
        tone: 'success',
        message: `${nextClaim?.claimCode || 'Claim'} was submitted and is ready for review.`,
      })
      resetForm(claimablePolicies.find((policy) => policy.policyId !== selectedPolicy.policyId)?.policyId || '')
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: error.message || 'Failed to submit the claim.',
      })
    }
  }

  return (
    <div className="layout">
      <Sidebar activePage="claims" onNavigate={onNavigate} onSignOut={onSignOut} />
      <div className="layout__main">
        <Topbar onNavigate={onNavigate} user={user} currentPageLabel={currentPageLabel} />
        <main className="claims">
          <div className="page-header">
            <div>
              <h1 className="page-header__title">Insurance Claims</h1>
              <p className="page-header__sub">Submit and track claims for issued policies linked to your account.</p>
            </div>
            <button className="btn-primary" onClick={() => onNavigate('proposals')}>
              Review Proposals
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card__label">Eligible Policies</div>
              <div className="stat-card__value stat-card__value--navy">{eligiblePolicies.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Claims In Review</div>
              <div className="stat-card__value stat-card__value--amber">{inReviewClaimsCount}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__label">Resolved Claims</div>
              <div className="stat-card__value stat-card__value--green">{resolvedClaimsCount}</div>
            </div>
          </div>

          <div className="info-banner claims__banner">
            <div className="info-banner__icon">
              <InfoIcon />
            </div>
            <div className="info-banner__text">
              Submit claim details here and review status updates from the claims history.
            </div>
          </div>

          <div className="claims-grid">
            <section className="submission-card">
              <div>
                <h2 className="submission-card__title">Submit A Claim</h2>
                <p className="claims-section__sub">
                  One claim can be submitted per tracked policy. Submitted claims appear immediately in claim history.
                </p>
              </div>

              {feedback.message ? (
                <div className={`claims-feedback claims-feedback--${feedback.tone || 'info'}`}>
                  {feedback.message}
                </div>
              ) : null}

              {claimablePolicies.length > 0 ? (
                <form className="claims-form" onSubmit={handleSubmit}>
                  <div className="claim-form-grid">
                    <div className="form-group claim-form-grid__wide">
                      <label className="form-label" htmlFor="claim-policy">Issued Policy</label>
                      <select
                        id="claim-policy"
                        className="form-control"
                        value={formState.policyId}
                        onChange={(event) => handleFieldChange('policyId', event.target.value)}
                      >
                        {claimablePolicies.map((policy) => (
                          <option key={policy.policyId} value={policy.policyId}>
                            {policy.policyName} · {policy.policyId}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="claim-date">Incident Date</label>
                      <input
                        id="claim-date"
                        className="form-control"
                        type="date"
                        max={new Date().toISOString().slice(0, 10)}
                        value={formState.incidentDate}
                        onChange={(event) => handleFieldChange('incidentDate', event.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="claim-category">Policy Category</label>
                      <input
                        id="claim-category"
                        className="form-control"
                        value={selectedPolicy?.policyCategory || 'Unavailable'}
                        disabled
                      />
                    </div>

                    <div className="form-group claim-form-grid__wide">
                      <label className="form-label" htmlFor="claim-description">Description</label>
                      <textarea
                        id="claim-description"
                        className="form-control submission-textarea submission-textarea--large"
                        rows={8}
                        value={formState.description}
                        onChange={(event) => handleFieldChange('description', event.target.value)}
                        placeholder="Describe the incident, what was damaged, and any immediate actions taken."
                      />
                    </div>
                  </div>

                  <div className="submission-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => {
                        setFeedback({ tone: '', message: '' })
                        resetForm(formState.policyId || claimablePolicies[0]?.policyId || '')
                      }}
                    >
                      Reset
                    </button>
                    <button type="submit" className="btn-primary">
                      Submit Claim
                    </button>
                  </div>
                </form>
              ) : (
                <div className="claims-empty">
                  {eligiblePolicies.length === 0
                    ? 'No issued policies are available for claims yet. Approve a proposal first so a policy ID exists.'
                    : 'A claim has already been submitted for every eligible policy.'}
                </div>
              )}
            </section>

            <section className="claims-card">
              <div className="claims-card__header">
                <h2 className="claims-card__title">Eligible Policies</h2>
              </div>
              {eligiblePolicies.length > 0 ? (
                <div className="claims-policy-list">
                  {eligiblePolicies.map((policy) => {
                    const linkedClaim = claimsByPolicyId.get(policy.policyId)
                    const selectable = !linkedClaim

                    return (
                      <button
                        key={policy.policyId}
                        type="button"
                        className={`claims-policy-item ${formState.policyId === policy.policyId ? 'claims-policy-item--selected' : ''}`}
                        onClick={() => {
                          if (selectable) {
                            handleFieldChange('policyId', policy.policyId)
                          }

                          if (linkedClaim) {
                            setSelectedClaimId(linkedClaim.id)
                          }
                        }}
                      >
                        <div>
                          <div className="claims-policy-item__title">{policy.policyName}</div>
                          <div className="claims-policy-item__meta">{policy.policyCategory} · {policy.policyId}</div>
                        </div>
                        <div className="claims-policy-item__badge">
                          {linkedClaim ? formatClaimStatus(linkedClaim.status) : titleCase(policy.policyStatus || 'ready')}
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="claims-empty">No issued policies are currently available for claim submission.</div>
              )}
            </section>
          </div>

          <section className="claims-card claims-card--history">
            <div className="claims-card__header claims-card__header--split">
              <div>
                <h2 className="claims-card__title">Claim History</h2>
                <p className="claims-section__sub">Review claim status and admin notes.</p>
              </div>
              <button
                className="btn-secondary"
                type="button"
                onClick={() => loadClaims({ forceRefresh: true })}
                disabled={claimsLoading}
              >
                Refresh
              </button>
            </div>

            {claimsError ? (
              <div className="claims-feedback claims-feedback--error">{claimsError}</div>
            ) : null}

            {claimsLoading ? (
              <div className="claims-empty">Loading claims...</div>
            ) : claims.length > 0 ? (
              claims.map((claim) => (
                <button
                  key={claim.id}
                  type="button"
                  className="claim-row"
                  onClick={() => setSelectedClaimId(claim.id)}
                >
                  <div className="claim-row__left">
                    <div className="claim-row__icon">
                      <DocumentIcon />
                    </div>
                    <div>
                      <div className="claim-row__type">{claim.policyName || 'Claim'}</div>
                      <div className="claim-row__meta">
                        {claim.claimCode} · {claim.policyName} · Submitted {formatDate(claim.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="claim-row__right">
                    <span className={getStatusBadgeClass(claim.status)}>
                      <span className="status-badge__dot" />
                      {formatClaimStatus(claim.status)}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="claims-empty">No claims have been submitted yet.</div>
            )}
          </section>

          {selectedClaim ? (
            <div className="modal-overlay" onClick={() => setSelectedClaimId('')}>
              <div
                className="modal modal--detail claims-modal"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="modal__header">
                  <div>
                    <h2 className="modal__title">{selectedClaim.claimCode}</h2>
                    <p className="modal__subtitle">{selectedClaim.policyName} · {selectedClaim.policyId}</p>
                  </div>
                  <button className="modal__close" type="button" onClick={() => setSelectedClaimId('')}>
                    ×
                  </button>
                </div>

                <div className="detail-rows">
                  <div className="detail-row">
                    <div className="detail-row__label">Status</div>
                    <div className="detail-row__value">{formatClaimStatus(selectedClaim.status)}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-row__label">Policy Category</div>
                    <div className="detail-row__value">{selectedClaim.policyCategory || 'Unavailable'}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-row__label">Incident Date</div>
                    <div className="detail-row__value">{selectedClaim.incidentDate ? formatDate(selectedClaim.incidentDate) : 'Not recorded'}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-row__label">Submitted</div>
                    <div className="detail-row__value">{formatDate(selectedClaim.createdAt)}</div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-row__label">Priority</div>
                    <div className="detail-row__value">{selectedClaim.priority ? titleCase(selectedClaim.priority) : 'Not assigned'}</div>
                  </div>
                </div>

                <div className="claims-modal__section">
                  <div className="claims-modal__label">Description</div>
                  <div className="claims-modal__body">{selectedClaim.description || 'No description provided.'}</div>
                </div>

                <div className="claims-modal__section">
                  <div className="claims-modal__label">Admin Note</div>
                  <div className="claims-modal__body">{selectedClaim.adminNote || 'No admin note yet.'}</div>
                </div>

                <button className="btn-close-modal" type="button" onClick={() => setSelectedClaimId('')}>
                  Close
                </button>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
