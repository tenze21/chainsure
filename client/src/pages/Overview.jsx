import React from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import './Overview.css'

const POLICIES = [
  {
    id: 1,
    name: 'Travel Insurance',
    token: 'Token #1042',
    expires: 'Expires Dec 2026',
    status: 'Active',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012.86 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
      </svg>
    ),
    color: '#DBEAFE', iconColor: '#2563EB',
  },
  {
    id: 2,
    name: 'Motor Insurance',
    token: 'Token #1041',
    expires: 'Expires Mar 2027',
    status: 'Active',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    color: '#FEF3C7', iconColor: '#D97706',
  },
  {
    id: 3,
    name: 'Life Insurance',
    token: 'Token #1040',
    expires: 'Expires Jan 2046',
    status: 'Active',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    ),
    color: '#FCE7F3', iconColor: '#DB2777',
  },
]

const QUICK_LINKS = [
  {
    id: 'browse', title: 'Browse Policies', subtitle: 'Find new insurance products',
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>),
    color: '#E0FAF4', iconColor: '#00C8A0',
  },
  {
    id: 'claim', title: 'File a Claim', subtitle: 'Submit a new insurance claim',
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>),
    color: '#FEF9EC', iconColor: '#F59E0B',
  },
  {
    id: 'proposals', title: 'Proposals', subtitle: 'Protect what matters',
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>),
    color: '#EDE9FE', iconColor: '#7C3AED',
  },
]

export default function Overview({ onNavigate }) {
  return (
    <div className="layout">
      <Sidebar activePage="overview" onNavigate={onNavigate} />
      <div className="layout__main">
        <Topbar onNavigate={onNavigate} />
        <main className="overview">
          <div className="overview__header">
            <h1 className="overview__title">Good morning, Tenzin</h1>
            <p className="overview__subtitle">Here is a summary of your insurance portfolio.</p>
          </div>

          <div className="stats">
            <div className="stat-card">
              <p className="stat-card__label">Active Policies</p>
              <p className="stat-card__value stat-card__value--teal">3</p>
              <p className="stat-card__note">All verified on-chain</p>
            </div>
            <div className="stat-card">
              <p className="stat-card__label">Total Coverage</p>
              <p className="stat-card__value stat-card__value--dark">Nu. 55,00,000</p>
              <p className="stat-card__note">Across all policies</p>
            </div>
            <div className="stat-card">
              <p className="stat-card__label">Pending Claims</p>
              <p className="stat-card__value stat-card__value--amber">1</p>
              <p className="stat-card__note">Under review</p>
            </div>
          </div>

          <div className="panel">
            <div className="panel__header">
              <h2 className="panel__title">Your Policies</h2>
              <button className="panel__view-all" onClick={() => onNavigate('policies')}>
                View All
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
            <div className="policy-list">
              {POLICIES.map((policy) => (
                <div key={policy.id} className="policy-item">
                  <div className="policy-item__icon" style={{ background: policy.color, color: policy.iconColor }}>{policy.icon}</div>
                  <div className="policy-item__info">
                    <p className="policy-item__name">{policy.name}</p>
                    <p className="policy-item__meta">{policy.token} · {policy.expires}</p>
                  </div>
                  <div className="policy-item__actions">
                    <span className="badge badge--active"><span className="badge__dot" />{policy.status}</span>
                    <button className="policy-item__eye">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
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