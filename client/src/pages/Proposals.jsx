import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import StripeCheckoutModal from './StripeCheckoutModal'
import './Proposals.css'

const APPLICATIONS = [
  {
    id: 'APP-001',
    type: 'Life Insurance',
    applicationType: 'health',
    submittedDate: 'Feb 28, 2026',
    requestedCoverage: 'Nu. 50,00,000',
    term: '20 Years',
    status: 'Pending',
    healthInfo: {
      age: 35,
      bmi: '24.9',
      smoking: 'Never',
      conditions: 'None',
    },
  },
  {
    id: 'APP-002',
    type: 'Motor Insurance',
    applicationType: 'vehicle',
    submittedDate: 'Mar 01, 2026',
    requestedCoverage: 'Nu. 25,00,000',
    coverageType: 'Comprehensive',
    status: 'Approved',
    vehicleInfo: {
      make: 'Toyota',
      model: 'Corolla',
      year: '2022',
      registration: 'BT-1-A-5678',
    },
    approvedPremium: 'Nu.450',
    premiumPeriod: '/month',
    approvedDeductible: 'Nu.15,000',
    approvedCoverage: 'Nu.25,00,000',
    adminNotes: 'Standard premium applied. Zero depreciation add-on included',
    offerExpires: 'Mar 15, 2026',
  },
]

// ─── Icons ────────────────────────────────────────────────────────────────────

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

const ClipboardIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="4" rx="1" ry="1" />
    <path d="M17 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M9 12h6M9 16h4" />
  </svg>
)

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  if (status === 'Pending') {
    return (
      <span className="proposals__badge proposals__badge--pending">
        <ClockIcon size={12} />
        Pending
      </span>
    )
  }
  return (
    <span className="proposals__badge proposals__badge--approved">
      <CheckIcon size={12} />
      Approved
    </span>
  )
}

// ─── Application Card (left list) ────────────────────────────────────────────

function AppCard({ app, isSelected, onClick }) {
  return (
    <div
      className={`proposals__card ${isSelected ? 'proposals__card--selected' : ''} ${app.status === 'Approved' ? 'proposals__card--approved-border' : ''}`}
      onClick={onClick}
    >
      <div className="proposals__card-top">
        <div className={`proposals__card-icon ${app.applicationType === 'health' ? 'proposals__card-icon--health' : 'proposals__card-icon--vehicle'}`}>
          {app.applicationType === 'health' ? <HeartIcon /> : <CarIcon />}
        </div>
        <div className="proposals__card-info">
          <p className="proposals__card-name">{app.type}</p>
          <p className="proposals__card-meta">{app.id} · {app.submittedDate}</p>
        </div>
        <StatusBadge status={app.status} />
      </div>
      <div className="proposals__card-bottom">
        <span>{app.requestedCoverage}</span>
        {app.term && <><span className="proposals__card-dot">·</span><span>{app.term}</span></>}
        {app.coverageType && <><span className="proposals__card-dot">·</span><span>{app.coverageType}</span></>}
      </div>
    </div>
  )
}

// ─── Empty Detail Panel ───────────────────────────────────────────────────────

function EmptyDetail() {
  return (
    <div className="proposals__detail proposals__detail--empty">
      <div className="proposals__empty-icon">
        <ClipboardIcon />
      </div>
      <p className="proposals__empty-title">Select an Application</p>
      <p className="proposals__empty-sub">Choose an application from the list to review health details and premium.</p>
    </div>
  )
}

// ─── Pending Detail Panel ─────────────────────────────────────────────────────

function PendingDetail({ app }) {
  return (
    <div className="proposals__detail">
      <div className="proposals__detail-header">
        <div className="proposals__detail-title-row">
          <div className={`proposals__detail-icon ${app.applicationType === 'health' ? 'proposals__card-icon--health' : 'proposals__card-icon--vehicle'}`}>
            {app.applicationType === 'health' ? <HeartIcon /> : <CarIcon />}
          </div>
          <div>
            <p className="proposals__detail-name">{app.type}</p>
            <p className="proposals__detail-sub">{app.id} · Submitted {app.submittedDate}</p>
          </div>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="proposals__info-grid proposals__info-grid--2">
        <div className="proposals__info-cell proposals__info-cell--filled">
          <p className="proposals__info-label">Requested Coverage</p>
          <p className="proposals__info-value">{app.requestedCoverage}</p>
        </div>
        <div className="proposals__info-cell proposals__info-cell--filled">
          <p className="proposals__info-label">Term</p>
          <p className="proposals__info-value">{app.term}</p>
        </div>
      </div>

      <div className="proposals__section">
        <p className="proposals__section-title">Your Submitted Health Info</p>
        <div className="proposals__info-grid proposals__info-grid--4">
          <div className="proposals__info-cell proposals__info-cell--bordered">
            <p className="proposals__info-label">Age</p>
            <p className="proposals__info-value">{app.healthInfo.age} years</p>
          </div>
          <div className="proposals__info-cell proposals__info-cell--bordered">
            <p className="proposals__info-label">BMI</p>
            <p className="proposals__info-value">{app.healthInfo.bmi}</p>
          </div>
          <div className="proposals__info-cell proposals__info-cell--bordered">
            <p className="proposals__info-label">Smoking</p>
            <p className="proposals__info-value">{app.healthInfo.smoking}</p>
          </div>
          <div className="proposals__info-cell proposals__info-cell--bordered">
            <p className="proposals__info-label">Conditions</p>
            <p className="proposals__info-value">{app.healthInfo.conditions}</p>
          </div>
        </div>
      </div>

      <div className="proposals__under-review">
        <div className="proposals__under-review-icon">
          <ClockIcon size={36} />
        </div>
        <p className="proposals__under-review-title">Application Under Review</p>
        <p className="proposals__under-review-text">
          Our team is reviewing your application. Once approved, you will see the premium and deductible set by the admin. You can then proceed to purchase the policy.
        </p>
        <p className="proposals__under-review-note">Typical review time: 1-2 business days</p>
      </div>
    </div>
  )
}

// ─── Approved Detail Panel ────────────────────────────────────────────────────

function ApprovedDetail({ app, onPurchase }) {
  return (
    <div className="proposals__detail">
      <div className="proposals__detail-header">
        <div className="proposals__detail-title-row">
          <div className={`proposals__detail-icon ${app.applicationType === 'health' ? 'proposals__card-icon--health' : 'proposals__card-icon--vehicle'}`}>
            {app.applicationType === 'health' ? <HeartIcon /> : <CarIcon />}
          </div>
          <div>
            <p className="proposals__detail-name">{app.type}</p>
            <p className="proposals__detail-sub">{app.id} · Submitted {app.submittedDate}</p>
          </div>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="proposals__info-grid proposals__info-grid--2">
        <div className="proposals__info-cell proposals__info-cell--filled">
          <p className="proposals__info-label">Requested Coverage</p>
          <p className="proposals__info-value">{app.requestedCoverage}</p>
        </div>
        <div className="proposals__info-cell proposals__info-cell--filled">
          <p className="proposals__info-label">Term</p>
          <p className="proposals__info-value">{app.coverageType}</p>
        </div>
      </div>

      {app.vehicleInfo && (
        <div className="proposals__section">
          <p className="proposals__section-title">Your Submitted Vehicle Info</p>
          <div className="proposals__info-grid proposals__info-grid--4">
            <div className="proposals__info-cell proposals__info-cell--bordered">
              <p className="proposals__info-label">Make</p>
              <p className="proposals__info-value">{app.vehicleInfo.make}</p>
            </div>
            <div className="proposals__info-cell proposals__info-cell--bordered">
              <p className="proposals__info-label">Model</p>
              <p className="proposals__info-value">{app.vehicleInfo.model}</p>
            </div>
            <div className="proposals__info-cell proposals__info-cell--bordered">
              <p className="proposals__info-label">Year</p>
              <p className="proposals__info-value">{app.vehicleInfo.year}</p>
            </div>
            <div className="proposals__info-cell proposals__info-cell--bordered">
              <p className="proposals__info-label">Registration</p>
              <p className="proposals__info-value proposals__info-value--mono">{app.vehicleInfo.registration}</p>
            </div>
          </div>
        </div>
      )}

      <div className="proposals__approved-box">
        <div className="proposals__approved-box-header">
          <span className="proposals__approved-check"><CheckIcon size={16} /></span>
          <p className="proposals__approved-box-title">Application Approved</p>
        </div>
        <p className="proposals__approved-box-sub">
          Great news! Your application has been approved. Review the policy terms below and proceed to purchase.
        </p>
        <div className="proposals__info-grid proposals__info-grid--3">
          <div className="proposals__info-cell proposals__info-cell--white">
            <p className="proposals__info-label">Your Premium</p>
            <p className="proposals__premium-value">{app.approvedPremium}<span className="proposals__premium-period">{app.premiumPeriod}</span></p>
          </div>
          <div className="proposals__info-cell proposals__info-cell--white">
            <p className="proposals__info-label">Deductible</p>
            <p className="proposals__premium-value">{app.approvedDeductible}</p>
          </div>
          <div className="proposals__info-cell proposals__info-cell--white">
            <p className="proposals__info-label">Coverage Amount</p>
            <p className="proposals__premium-value">{app.approvedCoverage}</p>
          </div>
        </div>
        {app.adminNotes && (
          <div className="proposals__admin-notes">
            <p className="proposals__info-label">Admin Notes</p>
            <p className="proposals__admin-notes-text">{app.adminNotes}</p>
          </div>
        )}
      </div>

      <div className="proposals__offer-expires">
        <div>
          <p className="proposals__offer-label">Offer Expires</p>
          <p className="proposals__offer-sub">Complete your purchase before this date</p>
        </div>
        <span className="proposals__offer-date">
          <ClockIcon size={13} />
          {app.offerExpires}
        </span>
      </div>

      <button className="proposals__purchase-btn" onClick={onPurchase}>Purchase Policy</button>
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function Proposals({ onNavigate }) {
  const [selectedId, setSelectedId]       = useState(null)
  const [showCheckout, setShowCheckout]   = useState(false)

  const selected = APPLICATIONS.find((a) => a.id === selectedId) || null

  const pendingCount  = APPLICATIONS.filter((a) => a.status === 'Pending').length
  const approvedCount = APPLICATIONS.filter((a) => a.status === 'Approved').length

  const handlePaymentSuccess = () => {
    setShowCheckout(false)
    alert('Payment successful! Your policy NFT has been minted to your wallet.')
  }

  return (
    <div className="layout">
      <Sidebar activePage="proposals" onNavigate={onNavigate} />
      <div className="layout__main">
        <Topbar onNavigate={onNavigate} />
        <main className="proposals">

          {/* Header */}
          <div className="proposals__header">
            <div>
              <h1 className="proposals__title">My Proposals</h1>
              <p className="proposals__subtitle">Track your insurance applications and view admin decisions.</p>
            </div>
            <div className="proposals__badges">
              {pendingCount > 0 && (
                <span className="proposals__header-badge proposals__header-badge--pending">
                  {pendingCount} Pending
                </span>
              )}
              {approvedCount > 0 && (
                <span className="proposals__header-badge proposals__header-badge--approved">
                  {approvedCount} Ready to Purchase
                </span>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="proposals__body">
            {/* Left — application list */}
            <div className="proposals__list">
              <p className="proposals__list-label">All Applications</p>
              {APPLICATIONS.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  isSelected={selectedId === app.id}
                  onClick={() => setSelectedId(app.id)}
                />
              ))}
            </div>

            {/* Right — detail panel */}
            {!selected && <EmptyDetail />}
            {selected && selected.status === 'Pending'  && <PendingDetail  app={selected} />}
            {selected && selected.status === 'Approved' && <ApprovedDetail app={selected} onPurchase={() => setShowCheckout(true)} />}
          </div>

        </main>
      </div>

      {showCheckout && (
        <StripeCheckoutModal
          app={selected}
          onClose={() => setShowCheckout(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

    </div>
  )
}