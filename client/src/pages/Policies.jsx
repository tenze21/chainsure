import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import './Policies.css'

const POLICIES = [
  {
    id: 'travel',
    name: 'Travel Insurance',
    policyNumber: 'TRV-2024-001042',
    status: 'Active',
    coverage: 'Nu. 10,00,000',
    premium: 'Nu. 5000/ year',
    expires: 'Dec 15, 2026',
    startDate: 'Dec 15, 2024',
    deductible: 'Nu. 2500',
    extraLabel: 'Covered Destination',
    extraValue: 'Thimphu, Bhutan',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012.86 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
      </svg>
    ),
  },
  {
    id: 'motor',
    name: 'Motor Insurance',
    policyNumber: 'MTR-2024-001041',
    status: 'Active',
    coverage: 'Nu. 25,00,000',
    premium: 'Nu. 5000/ year',
    expires: 'Mar 01, 2027',
    startDate: 'Dec 15, 2024',
    deductible: 'Nu. 2500',
    extraLabel: 'Vehicle Details',
    extraValue: 'Toyota Fortuner - BP-1-A-1234',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    id: 'life',
    name: 'Life Insurance',
    policyNumber: 'LIF-2024-001040',
    status: 'Active',
    coverage: 'Nu. 50,00,000',
    premium: 'Nu. 5000/ year',
    expires: 'Jan 10, 2046',
    startDate: 'Dec 15, 2024',
    deductible: 'Nu. 2500',
    extraLabel: 'Beneficiary',
    extraValue: 'Karma Dorji (Spouse)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    ),
  },
]

function generatePolicyPDF(policy) {
  const content = `
CHAINSURE INSURANCE POLICY DOCUMENT
====================================

Policy Name      : ${policy.name}
Policy Number    : ${policy.policyNumber}
Status           : ${policy.status}
Coverage Amount  : ${policy.coverage}
Premium          : ${policy.premium}
Start Date       : ${policy.startDate}
Expiry Date      : ${policy.expires}
Deductible       : ${policy.deductible}
${policy.extraLabel.padEnd(17)}: ${policy.extraValue}

------------------------------------
This document serves as proof of insurance coverage
issued by ChainSure, verified on-chain.

Policyholder     : Tenzin Choda
Issued by        : ChainSure Insurance Platform
Date of Issue    : ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}

All policies are NFT-backed and verifiable on the
ChainSure blockchain network.

------------------------------------
ChainSure | Blockchain-Verified Insurance
  `.trim()

  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${policy.policyNumber}_ChainSure_Policy.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Policies({ onNavigate }) {
  const [selected, setSelected] = useState(null)

  return (
    <div className="layout">
      <Sidebar activePage="policies" onNavigate={onNavigate} />
      <div className="layout__main">
        <Topbar />
        <main className="policies">
          <div className="policies__header">
            <h1 className="policies__title">Your Policies</h1>
            <p className="policies__subtitle">Your insurance policies.</p>
          </div>

          <div className="policies__body">
            {/* Left: policy list */}
            <div className="policy-list">
              {POLICIES.map((policy) => (
                <div
                  key={policy.id}
                  className={`policy-card ${selected?.id === policy.id ? 'policy-card--selected' : ''}`}
                  onClick={() => setSelected(policy)}
                >
                  <div className="policy-card__top">
                    <div className="policy-card__icon">{policy.icon}</div>
                    <div className="policy-card__info">
                      <span className="policy-card__name">{policy.name}</span>
                      <span className="policy-card__number">Policy: {policy.policyNumber}</span>
                    </div>
                    <span className="badge badge--active">
                      <span className="badge__dot" />
                      {policy.status}
                    </span>
                  </div>
                  <div className="policy-card__stats">
                    <div className="policy-stat">
                      <span className="policy-stat__label">Coverage</span>
                      <span className="policy-stat__value">{policy.coverage}</span>
                    </div>
                    <div className="policy-stat">
                      <span className="policy-stat__label">
                        {selected?.id === policy.id ? 'Premium' : 'Premium'}
                      </span>
                      <span className="policy-stat__value">
                        {selected ? policy.expires : policy.premium}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: detail panel */}
            <div className="policy-detail">
              {!selected ? (
                <div className="policy-detail__empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#b0c4d4' }}>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <line x1="10" y1="9" x2="8" y2="9"/>
                  </svg>
                  <p>Select a policy to view details</p>
                </div>
              ) : (
                <div className="policy-detail__content">
                  <div className="policy-detail__heading">
                    <div className="policy-detail__icon">{selected.icon}</div>
                    <div>
                      <h2 className="policy-detail__name">{selected.name}</h2>
                      <span className="badge badge--active" style={{ marginTop: 4, display: 'inline-flex' }}>
                        <span className="badge__dot" />
                        {selected.status}
                      </span>
                    </div>
                  </div>

                  <div className="policy-detail__grid">
                    <div className="detail-field">
                      <span className="detail-field__label">Policy Number</span>
                      <span className="detail-field__value">{selected.policyNumber}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-field__label">Premium</span>
                      <span className="detail-field__value">{selected.premium}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-field__label">Coverage Amount</span>
                      <span className="detail-field__value">{selected.coverage}</span>
                    </div>
                    <div className="detail-field">
                      <span className="detail-field__label">Start Date</span>
                      <span className="detail-field__value">{selected.startDate}</span>
                    </div>
                    <div className="detail-field detail-field--full">
                      <span className="detail-field__label">Deductible</span>
                      <span className="detail-field__value">{selected.deductible}</span>
                    </div>
                    <div className="detail-field detail-field--full">
                      <span className="detail-field__label">{selected.extraLabel}</span>
                      <span className="detail-field__value">{selected.extraValue}</span>
                    </div>
                  </div>

                  <div className="policy-detail__actions">
                    <button
                      className="detail-btn detail-btn--outline"
                      onClick={() => generatePolicyPDF(selected)}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download Policy
                    </button>
                    <button className="detail-btn detail-btn--ghost">
                      File a Claim
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}