import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import './Claims.css'

const CLAIMS = [
  {
    id: 'CLM-001',
    type: 'Medical Expense',
    policy: 'Travel Insurance #1042',
    date: 'Feb 20, 2026',
    status: 'Under Review',
    badgeClass: 'status-badge--review',
  },
  {
    id: 'CLM-002',
    type: 'Accident',
    policy: 'Motor Insurance #1041',
    date: 'Jan 05, 2026',
    status: 'Approved',
    badgeClass: 'status-badge--approved',
  },
  {
    id: 'CLM-003',
    type: 'Theft',
    policy: 'Motor Insurance #1041',
    date: 'Nov 15, 2025',
    status: 'Denied',
    badgeClass: 'status-badge--denied',
  },
]

const POLICIES = [
  'Travel Insurance #1042',
  'Motor Insurance #1041',
  'Home Insurance #1043',
]

// ─── Shared Sub-components ────────────────────────────────────────────────────

function StatusBadge({ status, badgeClass }) {
  return (
    <span className={`status-badge ${badgeClass}`}>
      <span className="status-badge__dot" />
      {status}
    </span>
  )
}

function ClaimRow({ claim, onClick }) {
  return (
    <div className="claim-row" onClick={() => onClick && onClick(claim)}>
      <div className="claim-row__left">
        <div className="claim-row__icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <div>
          <div className="claim-row__type">{claim.type}</div>
          <div className="claim-row__meta">
            {claim.id} · {claim.policy} · {claim.date}
          </div>
        </div>
      </div>
      <StatusBadge status={claim.status} badgeClass={claim.badgeClass} />
    </div>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ claim, onClose }) {
  if (!claim) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--detail" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <h2 className="modal__title">{claim.type}</h2>
            <p className="modal__subtitle">{claim.id}</p>
          </div>
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <div className="detail-rows">
          <div className="detail-row">
            <span className="detail-row__label">Policy</span>
            <span className="detail-row__value">{claim.policy}</span>
          </div>
          <div className="detail-row">
            <span className="detail-row__label">Filed Date</span>
            <span className="detail-row__value">{claim.date}</span>
          </div>
          <div className="detail-row">
            <span className="detail-row__label">Status</span>
            <StatusBadge status={claim.status} badgeClass={claim.badgeClass} />
          </div>
        </div>
        <button className="btn-close-modal" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

// ─── Claim Application View ───────────────────────────────────────────────────

function ClaimApplicationView({ onCancel, onSubmit, search }) {
  const [policy, setPolicy]     = useState('')
  const [body, setBody]         = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles]       = useState([])
  const [selectedClaim, setSelectedClaim] = useState(null)

  const filtered = CLAIMS.filter((c) =>
    [c.type, c.id, c.policy].some((f) =>
      f.toLowerCase().includes(search.toLowerCase())
    )
  )

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)])
  }

  const handleFileInput = (e) => {
    setFiles((prev) => [...prev, ...Array.from(e.target.files)])
  }

  const handleSubmit = () => {
    if (!policy) { alert('Please select a policy.'); return }
    onSubmit({ policy, body, files })
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Claim Application</h1>
          <p className="page-header__sub">File and track your insurance claims</p>
        </div>
        <button className="btn-primary" onClick={onCancel}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          File New Claim
        </button>
      </div>

      <div className="submission-card">
        <h2 className="submission-card__title">New Claim Submission</h2>

        <div className="form-group">
          <label className="form-label">Select Policy</label>
          <div className="select-wrap">
            <select
              className="form-control form-control--select"
              value={policy}
              onChange={(e) => setPolicy(e.target.value)}
            >
              <option value="">Choose a policy</option>
              {POLICIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <span className="select-caret">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Application body</label>
          <textarea
            className="form-control submission-textarea"
            placeholder="Write your application body here...."
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <div
          className={`upload-zone ${dragOver ? 'upload-zone--active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />
          <div className="upload-zone__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
          </div>
          <p className="upload-zone__text">
            Drag and drop supporting documents here, or<br />
            <span className="upload-zone__link">click to upload</span> PDF, JPG, PNG up to 10MB each
          </p>
          {files.length > 0 && (
            <ul className="upload-zone__files">
              {files.map((f, i) => (
                <li key={i} className="upload-zone__file">📎 {f.name}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="info-banner">
          <svg className="info-banner__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="info-banner__text">
            Submitting a claim sends an off-chain notification with your NFT Token ID to the administrator.
            The admin will review your claim and update the status manually.
          </p>
        </div>

        <div className="submission-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={handleSubmit}>Submit Claim</button>
        </div>
      </div>

      <div className="claims-card claims-card--history">
        <div className="claims-card__header">
          <h2 className="claims-card__title">Claim History</h2>
        </div>
        {filtered.length === 0 ? (
          <p className="claims-empty">No claims match your search.</p>
        ) : (
          filtered.map((claim) => (
            <ClaimRow key={claim.id} claim={claim} onClick={setSelectedClaim} />
          ))
        )}
      </div>

      {selectedClaim && (
        <DetailModal claim={selectedClaim} onClose={() => setSelectedClaim(null)} />
      )}
    </>
  )
}

// ─── Claims List View ─────────────────────────────────────────────────────────

function ClaimsListView({ onFileNew, search }) {
  const [selectedClaim, setSelectedClaim] = useState(null)

  const filtered = CLAIMS.filter((c) =>
    [c.type, c.id, c.policy].some((f) =>
      f.toLowerCase().includes(search.toLowerCase())
    )
  )

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Insurance Claims</h1>
          <p className="page-header__sub">File and track your insurance claims</p>
        </div>
        <button className="btn-primary" onClick={onFileNew}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          File New Claim
        </button>
      </div>

      <div className="claims-card">
        <div className="claims-card__header">
          <h2 className="claims-card__title">Claim History</h2>
        </div>
        {filtered.length === 0 ? (
          <p className="claims-empty">No claims match your search.</p>
        ) : (
          filtered.map((claim) => (
            <ClaimRow key={claim.id} claim={claim} onClick={setSelectedClaim} />
          ))
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__label">Total Claims</div>
          <div className="stat-card__value stat-card__value--navy">{CLAIMS.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Approved</div>
          <div className="stat-card__value stat-card__value--green">
            {CLAIMS.filter((c) => c.status === 'Approved').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Pending Review</div>
          <div className="stat-card__value stat-card__value--amber">
            {CLAIMS.filter((c) => c.status === 'Under Review').length}
          </div>
        </div>
      </div>

      {selectedClaim && (
        <DetailModal claim={selectedClaim} onClose={() => setSelectedClaim(null)} />
      )}
    </>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function Claims({ onNavigate }) {
  const [view, setView]   = useState('list') // 'list' | 'apply'
  const [search, setSearch] = useState('')

  const handleSubmitClaim = ({ policy, body, files }) => {
    alert(`Claim submitted!\nPolicy: ${policy}\nFiles: ${files.length}`)
    setView('list')
  }

  return (
    <div className="layout">
      <Sidebar activePage="claims" onNavigate={onNavigate} />
      <div className="layout__main">
        <Topbar onNavigate={onNavigate} search={search} setSearch={setSearch} />
        <main className="claims">
          {view === 'list' ? (
            <ClaimsListView
              onFileNew={() => setView('apply')}
              search={search}
            />
          ) : (
            <ClaimApplicationView
              onCancel={() => setView('list')}
              onSubmit={handleSubmitClaim}
              search={search}
            />
          )}
        </main>
      </div>
    </div>
  )
}