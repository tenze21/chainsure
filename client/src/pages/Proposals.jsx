import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import './Proposals.css'
import { formatDate } from '../lib/formatters'

const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
)

const CarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="2" />
    <path d="M16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)

const FileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
)

const ClockIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const CheckIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const XIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

function formatAttributeLabel(key) {
  return String(key || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (character) => character.toUpperCase())
}

function getProposalVisual(proposal) {
  const source = `${proposal?.category || ''} ${proposal?.name || ''}`.toLowerCase()

  if (source.includes('vehicle') || source.includes('motor')) {
    return { icon: <CarIcon />, className: 'proposals__card-icon--vehicle' }
  }

  if (source.includes('health') || source.includes('life')) {
    return { icon: <HeartIcon />, className: 'proposals__card-icon--health' }
  }

  return { icon: <FileIcon />, className: 'proposals__card-icon--document' }
}

function StatusBadge({ status }) {
  if (status === 'approved') {
    return (
      <span className="proposals__badge proposals__badge--approved">
        <CheckIcon size={12} />
        Approved
      </span>
    )
  }

  if (status === 'rejected') {
    return (
      <span className="proposals__badge proposals__badge--rejected">
        <XIcon size={12} />
        Rejected
      </span>
    )
  }

  return (
    <span className="proposals__badge proposals__badge--pending">
      <ClockIcon size={12} />
      Pending
    </span>
  )
}

function ProposalCard({ proposal, isSelected, onClick }) {
  const visual = getProposalVisual(proposal)

  return (
    <div
      className={`proposals__card ${isSelected ? 'proposals__card--selected' : ''}`}
      onClick={onClick}
    >
      <div className="proposals__card-top">
        <div className={`proposals__card-icon ${visual.className}`}>
          {visual.icon}
        </div>
        <div className="proposals__card-info">
          <p className="proposals__card-name">{proposal.name}</p>
          <p className="proposals__card-meta">{formatDate(proposal.createdAt)}</p>
        </div>
        <StatusBadge status={proposal.status} />
      </div>
      <div className="proposals__card-bottom">
        <span>{proposal.category}</span>
      </div>
    </div>
  )
}

function EmptyDetail({ message, onNavigate }) {
  return (
    <div className="proposals__detail proposals__detail--empty">
      <div className="proposals__empty-icon">
        <FileIcon />
      </div>
      <p className="proposals__empty-title">No Live Proposal Detail Available</p>
      <p className="proposals__empty-sub">{message}</p>
      <button className="proposals__empty-action" onClick={() => onNavigate('marketplace')}>
        Browse Marketplace
      </button>
    </div>
  )
}

function ProposalDetail({ proposal }) {
  const visual = getProposalVisual(proposal)
  const isApproved = proposal.status === 'approved'
  const isRejected = proposal.status === 'rejected'

  return (
    <div className="proposals__detail">
      <div className="proposals__detail-header">
        <div className="proposals__detail-title-row">
          <div className={`proposals__detail-icon ${visual.className}`}>
            {visual.icon}
          </div>
          <div>
            <p className="proposals__detail-name">{proposal.name}</p>
            <p className="proposals__detail-sub">Submitted {formatDate(proposal.createdAt)}</p>
          </div>
        </div>
        <StatusBadge status={proposal.status} />
      </div>

      <div className="proposals__info-grid proposals__info-grid--2">
        <div className="proposals__info-cell proposals__info-cell--filled">
          <p className="proposals__info-label">Template Name</p>
          <p className="proposals__info-value">{proposal.name}</p>
        </div>
        <div className="proposals__info-cell proposals__info-cell--filled">
          <p className="proposals__info-label">Category</p>
          <p className="proposals__info-value">{proposal.category}</p>
        </div>
      </div>

      <div className="proposals__section">
        <p className="proposals__section-title">Backend Contract On This Branch</p>
        <div className="proposals__integration-note">
          The current `GET /api/proposal/user` response only returns status, template name, category, and created date. Proposal details shown below are recovered only for submissions made from this client session, where the create response returned the proposal metadata once.
        </div>
      </div>

      {proposal.hasTrackedDetails && Object.keys(proposal.attributes).length > 0 && (
        <div className="proposals__section">
          <p className="proposals__section-title">Submitted Details</p>
          <div className="proposals__info-grid proposals__info-grid--2">
            {Object.entries(proposal.attributes).map(([key, value]) => (
              <div key={key} className="proposals__info-cell proposals__info-cell--filled">
                <p className="proposals__info-label">{formatAttributeLabel(key)}</p>
                <p className="proposals__info-value">{value || 'Not provided'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isApproved && !isRejected && (
        <div className="proposals__under-review">
          <div className="proposals__under-review-icon">
            <ClockIcon size={36} />
          </div>
          <p className="proposals__under-review-title">Application Under Review</p>
          <p className="proposals__under-review-text">
            The proposal is live and coming from the backend. Status updates are real, while older submissions without stored IDs will stay summary-only on this branch.
          </p>
        </div>
      )}

      {isApproved && (
        <div className="proposals__approved-box">
          <div className="proposals__approved-box-header">
            <span className="proposals__approved-check"><CheckIcon size={16} /></span>
            <p className="proposals__approved-box-title">Approved, But Not Purchasable Here</p>
          </div>
          <p className="proposals__approved-box-sub">
            Admin approval is visible, but the backend does not expose a user policy feed or a way to discover the policy ID required by `/api/payments/initiate/:policyId`.
          </p>
        </div>
      )}

      {isRejected && (
        <div className="proposals__rejected-box">
          <div className="proposals__approved-box-header">
            <span className="proposals__rejected-check"><XIcon size={16} /></span>
            <p className="proposals__approved-box-title">Rejected By Admin</p>
          </div>
          <p className="proposals__approved-box-sub">
            The rejection status is live from the backend. This branch does not expose a rejection note or proposal detail payload from the summary endpoint.
          </p>
        </div>
      )}
    </div>
  )
}

export default function Proposals({
  onNavigate,
  onSignOut,
  user,
  currentPageLabel,
  proposals,
  proposalsLoading,
  proposalsError,
  onRefresh,
}) {
  const [selectedKey, setSelectedKey] = useState(null)
  const selected = proposals.find((proposal) => proposal.key === selectedKey) || null
  const pendingCount = proposals.filter((proposal) => proposal.status === 'pending').length
  const approvedCount = proposals.filter((proposal) => proposal.status === 'approved').length

  useEffect(() => {
    if (!proposals.length) {
      setSelectedKey(null)
      return
    }

    if (!selectedKey || !proposals.some((proposal) => proposal.key === selectedKey)) {
      setSelectedKey(proposals[0].key)
    }
  }, [proposals, selectedKey])

  return (
    <div className="layout">
      <Sidebar activePage="proposals" onNavigate={onNavigate} onSignOut={onSignOut} />
      <div className="layout__main">
        <Topbar onNavigate={onNavigate} user={user} currentPageLabel={currentPageLabel} />
        <main className="proposals">
          <div className="proposals__header">
            <div>
              <h1 className="proposals__title">My Proposals</h1>
              <p className="proposals__subtitle">Live summaries from the backend proposal endpoint.</p>
            </div>
            <div className="proposals__badges">
              <button className="proposals__refresh-btn" onClick={onRefresh}>Refresh</button>
              {pendingCount > 0 && (
                <span className="proposals__header-badge proposals__header-badge--pending">
                  {pendingCount} Pending
                </span>
              )}
              {approvedCount > 0 && (
                <span className="proposals__header-badge proposals__header-badge--approved">
                  {approvedCount} Approved
                </span>
              )}
            </div>
          </div>

          <div className="proposals__body">
            <div className="proposals__list">
              <p className="proposals__list-label">Application Summaries</p>

              {proposalsLoading && <p className="proposals__list-helper">Loading backend proposal data.</p>}
              {!proposalsLoading && proposalsError && <p className="proposals__list-helper">{proposalsError}</p>}
              {!proposalsLoading && !proposalsError && !proposals.length && (
                <p className="proposals__list-helper">No proposals found for the current session.</p>
              )}

              {!proposalsLoading && !proposalsError && proposals.map((proposal) => (
                <ProposalCard
                  key={proposal.key}
                  proposal={proposal}
                  isSelected={selectedKey === proposal.key}
                  onClick={() => setSelectedKey(proposal.key)}
                />
              ))}
            </div>

            {!selected && (
              <EmptyDetail
                message={proposalsError || 'Open the marketplace and submit a proposal to start seeing live summaries here.'}
                onNavigate={onNavigate}
              />
            )}
            {selected && <ProposalDetail proposal={selected} />}
          </div>
        </main>
      </div>
    </div>
  )
}
