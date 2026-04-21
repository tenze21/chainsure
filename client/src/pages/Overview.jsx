import React from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import './Overview.css'
import { formatDate, titleCase } from '../lib/formatters'
import { getFirstName } from '../lib/session'

const QUICK_LINKS = [
  {
    id: 'browse',
    title: 'Browse Policies',
    subtitle: 'Explore available insurance products',
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>),
    color: '#E0FAF4',
    iconColor: '#00C8A0',
  },
  {
    id: 'claim',
    title: 'Claims Status',
    subtitle: 'Track submitted claim reviews',
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" /></svg>),
    color: '#FEF9EC',
    iconColor: '#F59E0B',
  },
  {
    id: 'proposals',
    title: 'Proposal Activity',
    subtitle: 'View your application summaries',
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>),
    color: '#EDE9FE',
    iconColor: '#7C3AED',
  },
]

function getProposalIcon(proposal) {
  const category = `${proposal?.category || ''} ${proposal?.name || ''}`.toLowerCase()

  if (category.includes('vehicle') || category.includes('motor')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    )
  }

  if (category.includes('health') || category.includes('life')) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    )
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function getBadgeClass(status) {
  if (status === 'approved') return 'badge badge--approved'
  if (status === 'rejected') return 'badge badge--rejected'
  return 'badge badge--pending'
}

export default function Overview({
  onNavigate,
  onSignOut,
  user,
  currentPageLabel,
  proposals,
  proposalsLoading,
  proposalsError,
  products,
  profileReady,
  missingProfileFields,
}) {
  const firstName = getFirstName(user?.fullName)
  const recentProposals = proposals.slice(0, 3)
  const availableProducts = products.filter((product) => product.templateStatus === 'ready').length
  const pendingCount = proposals.filter((proposal) => proposal.status === 'pending').length

  return (
    <div className="layout">
      <Sidebar activePage="overview" onNavigate={onNavigate} onSignOut={onSignOut} />
      <div className="layout__main">
        <Topbar onNavigate={onNavigate} user={user} currentPageLabel={currentPageLabel} />
        <main className="overview">
          <div className="overview__header">
            <h1 className="overview__title">Good morning, {firstName}</h1>
            <p className="overview__subtitle">
              {proposalsError || 'Track your proposals, policies, and claims from one place.'}
            </p>
            {!profileReady && (
              <p className="overview__subtitle">
                Complete your profile before applying. Missing: {missingProfileFields.join(', ')}.
              </p>
            )}
          </div>

          <div className="stats">
            <div className="stat-card">
              <p className="stat-card__label">Submitted Proposals</p>
              <p className="stat-card__value stat-card__value--teal">{proposalsLoading ? '...' : proposals.length}</p>
              <p className="stat-card__note">Applications submitted by you</p>
            </div>
            <div className="stat-card">
              <p className="stat-card__label">Available Products</p>
              <p className="stat-card__value stat-card__value--dark">{availableProducts}</p>
              <p className="stat-card__note">Products ready for application</p>
            </div>
            <div className="stat-card">
              <p className="stat-card__label">Pending Review</p>
              <p className="stat-card__value stat-card__value--amber">{proposalsLoading ? '...' : pendingCount}</p>
              <p className="stat-card__note">Applications awaiting decision</p>
            </div>
          </div>

          <div className="panel">
            <div className="panel__header">
              <h2 className="panel__title">Recent Proposal Activity</h2>
              <button className="panel__view-all" onClick={() => onNavigate('proposals')}>
                View All
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            {proposalsLoading && <p className="panel__helper">Loading your proposal summaries.</p>}
            {!proposalsLoading && proposalsError && <p className="panel__helper">{proposalsError}</p>}
            {!proposalsLoading && !proposalsError && !recentProposals.length && (
              <p className="panel__helper">No proposals have been submitted yet. Use the marketplace to open one of the configured forms.</p>
            )}

            {!proposalsLoading && !proposalsError && recentProposals.length > 0 && (
              <div className="policy-list">
                {recentProposals.map((proposal) => (
                  <div key={proposal.key} className="policy-item">
                    <div className="policy-item__icon" style={{ background: '#E9F0F5', color: '#011B35' }}>
                      {getProposalIcon(proposal)}
                    </div>
                    <div className="policy-item__info">
                      <p className="policy-item__name">{proposal.name}</p>
                      <p className="policy-item__meta">{proposal.category} - Submitted {formatDate(proposal.createdAt)}</p>
                    </div>
                    <div className="policy-item__actions">
                      <span className={getBadgeClass(proposal.status)}>
                        <span className="badge__dot" />
                        {titleCase(proposal.status)}
                      </span>
                      <button className="policy-item__eye" onClick={() => onNavigate('proposals')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="quick-links">
            {QUICK_LINKS.map((item) => (
              <button
                key={item.id}
                className="quick-link-card"
                onClick={() => {
                  if (item.id === 'browse') onNavigate('marketplace')
                  else if (item.id === 'claim') onNavigate('claims')
                  else if (item.id === 'proposals') onNavigate('proposals')
                }}
              >
                <div className="quick-link-card__icon" style={{ background: item.color, color: item.iconColor }}>{item.icon}</div>
                <div className="quick-link-card__text">
                  <p className="quick-link-card__title">{item.title}</p>
                  <p className="quick-link-card__subtitle">{item.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
