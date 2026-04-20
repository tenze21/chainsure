import React from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import './Policies.css'

export default function Policies({
  onNavigate,
  onSignOut,
  user,
  currentPageLabel,
  proposals,
  proposalsLoading,
  products,
}) {
  const approvedCount = proposals.filter((proposal) => proposal.status === 'approved').length
  const pendingCount = proposals.filter((proposal) => proposal.status === 'pending').length
  const connectedTemplates = products.filter((product) => product.templateStatus === 'ready').length
  const trackedPolicies = proposals.filter((proposal) => proposal.policyId)

  return (
    <div className="layout">
      <Sidebar activePage="policies" onNavigate={onNavigate} onSignOut={onSignOut} />
      <div className="layout__main">
        <Topbar onNavigate={onNavigate} user={user} currentPageLabel={currentPageLabel} />
        <main className="policies">
          <div className="policies__header">
            <h1 className="policies__title">Your Policies</h1>
            <p className="policies__subtitle">This page is constrained by the current backend contract.</p>
          </div>

          <section className="policies__unsupported-card">
            <h2 className="policies__unsupported-title">No User Policy Feed Exists On This Branch</h2>
            <p className="policies__unsupported-text">
              The server exposes policy creation and payment initiation, but it does not expose a user-facing `GET /api/policy` route. Without that route, the dashboard cannot list issued policies or resolve the policy IDs needed for payment from the client alone.
            </p>

            <div className="policies__unsupported-stats">
              <div className="policy-stat-card">
                <span className="policy-stat-card__label">Approved Proposals</span>
                <span className="policy-stat-card__value">{proposalsLoading ? '...' : approvedCount}</span>
              </div>
              <div className="policy-stat-card">
                <span className="policy-stat-card__label">Pending Proposals</span>
                <span className="policy-stat-card__value">{proposalsLoading ? '...' : pendingCount}</span>
              </div>
              <div className="policy-stat-card">
                <span className="policy-stat-card__label">Connected Templates</span>
                <span className="policy-stat-card__value">{connectedTemplates}</span>
              </div>
            </div>

            <div className="policies__unsupported-actions">
              <button className="detail-btn detail-btn--ghost" onClick={() => onNavigate('proposals')}>
                View Proposal Status
              </button>
              <button className="detail-btn detail-btn--outline" onClick={() => onNavigate('marketplace')}>
                Browse Marketplace
              </button>
            </div>

            {trackedPolicies.length > 0 && (
              <div style={{ marginTop: '24px', display: 'grid', gap: '12px' }}>
                {trackedPolicies.map((proposal) => (
                  <div key={proposal.key} className="policy-detail-card">
                    <div className="policy-detail-card__header">
                      <div>
                        <div className="policy-detail-card__title">{proposal.name}</div>
                        <div className="policy-detail-card__meta">{proposal.category}</div>
                      </div>
                      <span className={`badge ${proposal.policyStatus === 'payment_confirmed' ? 'badge--active' : ''}`}>
                        {proposal.policyStatus ? proposal.policyStatus.replace(/_/g, ' ') : 'payment pending'}
                      </span>
                    </div>
                    <div className="policy-detail-card__body">
                      <div className="policy-detail-card__field">
                        <span className="policy-detail-card__label">Tracked Policy ID</span>
                        <span className="policy-detail-card__value">{proposal.policyId}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
