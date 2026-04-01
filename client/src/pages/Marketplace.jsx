import React from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import './Marketplace.css'

const PRODUCTS = [
  {
    id: 'life', route: 'proposal-life', name: 'Life Insurance', coverage: 'Up to Nu. 50,00,000',
    features: ['Death benefit payout','Family beneficiary','NFT proof of coverage','20-year term'],
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>),
  },
  {
    id: 'travel', route: 'proposal-travel', name: 'Travel Insurance', coverage: 'Up to Nu. 10,00,000',
    features: ['Embassay-ready verification','Medical emergency cover','Trip cancellation','Global coverage'],
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012.86 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>),
  },
  {
    id: 'motor', route: 'proposal-motor', name: 'Motor Insurance', coverage: 'Up to Nu. 25,00,000',
    features: ['Comprehensive coverage','Third-party liability','Accident protection','Quick claims'],
    icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>),
  },
]

export default function Marketplace({ onNavigate }) {
  return (
    <div className="layout">
      <Sidebar activePage="marketplace" onNavigate={onNavigate} />
      <div className="layout__main">
        <Topbar onNavigate={onNavigate} />
        <main className="marketplace">
          <div className="marketplace__header">
            <div>
              <h1 className="marketplace__title">Insurance Marketplace</h1>
              <p className="marketplace__subtitle">Browse and purchase insurance products</p>
            </div>
            <button className="marketplace__filter-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filter
            </button>
          </div>
          <div className="marketplace__grid">
            {PRODUCTS.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-card__icon-wrap">{product.icon}</div>
                <h3 className="product-card__name">{product.name}</h3>
                <p className="product-card__coverage">{product.coverage}</p>
                <ul className="product-card__features">
                  {product.features.map((f, i) => (
                    <li key={i} className="product-card__feature">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="product-card__btn" onClick={() => onNavigate(product.route)}>
                  View Proposal Form
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}