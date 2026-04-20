import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import './Claims.css'

export default function Claims({
  onNavigate,
  onSignOut,
  user,
  currentPageLabel,
  proposals,
}) {
  const approvedCount = proposals.filter((proposal) => proposal.status === 'approved').length

  return (
    <div className="layout">
      <Sidebar activePage="claims" onNavigate={onNavigate} onSignOut={onSignOut} />
      <div className="layout__main">
        <Topbar onNavigate={onNavigate} user={user} currentPageLabel={currentPageLabel} />
        <main className="claims">
          <div className="page-header">
            <div>
              <h1 className="page-header__title">Insurance Claims</h1>
              <p className="page-header__sub">Claims cannot be integrated from the client on this backend snapshot.</p>
            </div>
            <button className="btn-primary" onClick={() => onNavigate('proposals')}>
              Review Proposals
            </button>
          </div>

          <div className="claims-card">
            <div className="claims-card__header">
              <h2 className="claims-card__title">Backend Limitation</h2>
            </div>
            <div className="claims-empty">
              The server models claims internally, but this branch does not expose user-facing claim routes for listing claims or creating new ones. Frontend integration would require new endpoints such as `GET /api/claim` and `POST /api/claim`.
            </div>
            <div className="claims__unsupported-footer">
              <div className="claims__unsupported-stat">
                <span className="claims__unsupported-stat-label">Approved proposals</span>
                <span className="claims__unsupported-stat-value">{approvedCount}</span>
              </div>
              <div className="claims__unsupported-actions">
                <button className="btn-primary" onClick={() => onNavigate('marketplace')}>
                  Browse Marketplace
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
