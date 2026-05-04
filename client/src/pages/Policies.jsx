import React, { useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import './Policies.css'

const ICONS = {
  health: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>),
  property: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>),
  motor: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>),
}

function formatDate(value) {
  if (!value) return '--'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '--' : date.toLocaleDateString()
}

function formatCurrency(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return 'Not available'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount)
}

function pickAttributes(attributes = {}, ...keys) {
  for (const key of keys) {
    if (attributes?.[key] !== undefined && attributes?.[key] !== '') {
      return attributes[key]
    }
  }
  return ''
}

function getPolicyIcon(name = '', category = '') {
  const source = `${name} ${category}`.toLowerCase()
  if (/(vehicle|motor|auto|car|fleet)/.test(source)) return ICONS.motor
  if (/(property|home|landlord|premises|rental)/.test(source)) return ICONS.property
  return ICONS.health
}

function generatePolicyPDF(policy) {
  const content = `CHAINSURE INSURANCE POLICY DOCUMENT\n====================================\n\nPolicy Name      : ${policy.name}\nPolicy Number    : ${policy.policyNumber}\nStatus           : ${policy.status}\nCoverage Amount  : ${policy.coverage}\nPremium          : ${policy.premium}\nStart Date       : ${policy.startDate}\nExpiry Date      : ${policy.expires}\nDeductible       : ${policy.deductible}\n${policy.extraLabel.padEnd(17)}: ${policy.extraValue}\n\nIssued by        : ChainSure Insurance Platform\nDate of Issue    : ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${policy.policyNumber}_ChainSure_Policy.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Policies({
  onNavigate,
  onSignOut,
  user,
  currentPageLabel,
  proposals = [],
  proposalsLoading = false,
  templates = [],
}) {
  const [selected, setSelected] = useState(null)
  const liveTemplates = Array.isArray(templates) ? templates : []
  const policyItems = useMemo(() => {
    function resolveTemplate(proposal) {
      const proposalName = String(proposal?.name || '').trim().toLowerCase()
      const proposalCategory = String(proposal?.category || '').trim().toLowerCase()

      if (proposalName) {
        const byName = liveTemplates.find((template) => String(template?.name || '').trim().toLowerCase() === proposalName)
        if (byName) {
          return byName
        }
      }

      if (proposalCategory) {
        return liveTemplates.find((template) => String(template?.category?.name || '').trim().toLowerCase() === proposalCategory) || null
      }

      return null
    }

    return (Array.isArray(proposals) ? proposals : [])
      .filter((proposal) => (
        proposal?.policyId
        || ['approved', 'payment_confirmed', 'active'].includes(String(proposal?.policyStatus || '').toLowerCase())
      ))
      .map((proposal, index) => {
        const attributes = proposal?.attributes || {}
        const template = resolveTemplate(proposal)
        const category = proposal?.category || 'General'
        const name = proposal?.name || 'Insurance Policy'
        const premiumRaw = pickAttributes(attributes, 'premium', 'premiumAmount', 'premium_amount')
        const deductibleRaw = pickAttributes(attributes, 'deductible', 'deductable', 'deductibleAmount', 'deductableAmount')

        return {
          id: proposal?.key || proposal?.policyId || `${name}-${index}`,
          name,
          policyNumber: proposal?.policyId || `POL-${String(index + 1).padStart(6, '0')}`,
          status: proposal?.policyStatus
            ? String(proposal.policyStatus).replace(/_/g, ' ')
            : (proposal?.status || 'approved'),
          coverage: formatCurrency(
            pickAttributes(attributes, 'coverageAmount', 'coverage_amount') || template?.coverageAmount,
          ),
          premium: premiumRaw ? `${formatCurrency(premiumRaw)} / period` : 'Pending',
          expires: pickAttributes(attributes, 'expiryDate', 'expires') || '--',
          startDate: formatDate(proposal?.createdAt),
          deductible: deductibleRaw
            ? formatCurrency(deductibleRaw)
            : 'Not specified',
          coverageDetails: String(template?.coverageDetails || '').trim() || 'Details not available',
          icon: getPolicyIcon(name, category),
        }
      })
  }, [proposals, liveTemplates])

  const normalizedSelected = selected && policyItems.some((item) => item.id === selected.id) ? selected : null

  return (
    <div className="layout">
      <Sidebar activePage="policies" onNavigate={onNavigate} onSignOut={onSignOut} />
      <div className="layout__main">
        <Topbar onNavigate={onNavigate} user={user} currentPageLabel={currentPageLabel} />
        <main className="policies">
          <div className="policies__header">
            <h1 className="policies__title">Your Policies</h1>
            <p className="policies__subtitle">Your insurance policies.</p>
          </div>
          <div className="policies__body">
            <div className="policy-list">
              {proposalsLoading ? (
                <div className="policy-detail__empty"><p>Loading policies...</p></div>
              ) : policyItems.length === 0 ? (
                <div className="policy-detail__empty"><p>No policies available yet.</p></div>
              ) : policyItems.map((policy) => (
                <div key={policy.id} className={`policy-card ${normalizedSelected?.id === policy.id ? 'policy-card--selected' : ''}`} onClick={() => setSelected(policy)}>
                  <div className="policy-card__top">
                    <div className="policy-card__icon">{policy.icon}</div>
                    <div className="policy-card__info">
                      <span className="policy-card__name">{policy.name}</span>
                      <span className="policy-card__number">Policy: {policy.policyNumber}</span>
                    </div>
                    <span className="badge badge--active"><span className="badge__dot" />{policy.status}</span>
                  </div>
                  <div className="policy-card__stats">
                    <div className="policy-stat">
                      <span className="policy-stat__label">Coverage</span>
                      <span className="policy-stat__value">{policy.coverage}</span>
                    </div>
                    <div className="policy-stat">
                      <span className="policy-stat__label">{normalizedSelected?.id === policy.id ? 'Expires' : 'Premium'}</span>
                      <span className="policy-stat__value">{normalizedSelected?.id === policy.id ? policy.expires : policy.premium}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="policy-detail">
              {!normalizedSelected ? (
                <div className="policy-detail__empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#b0c4d4' }}>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <p>Select a policy to view details</p>
                </div>
              ) : (
                <div className="policy-detail__content">
                  <div className="policy-detail__heading">
                    <div className="policy-detail__icon">{normalizedSelected.icon}</div>
                    <div>
                      <h2 className="policy-detail__name">{normalizedSelected.name}</h2>
                      <span className="badge badge--active" style={{ marginTop: 4, display: 'inline-flex' }}><span className="badge__dot" />{normalizedSelected.status}</span>
                    </div>
                  </div>
                  <div className="policy-detail__grid">
                    <div className="detail-field"><span className="detail-field__label">Policy Number</span><span className="detail-field__value">{normalizedSelected.policyNumber}</span></div>
                    <div className="detail-field"><span className="detail-field__label">Premium</span><span className="detail-field__value">{normalizedSelected.premium}</span></div>
                    <div className="detail-field"><span className="detail-field__label">Coverage Amount</span><span className="detail-field__value">{normalizedSelected.coverage}</span></div>
                    <div className="detail-field"><span className="detail-field__label">Start Date</span><span className="detail-field__value">{normalizedSelected.startDate}</span></div>
                    <div className="detail-field detail-field--full"><span className="detail-field__label">Deductible</span><span className="detail-field__value">{normalizedSelected.deductible}</span></div>
                    <div className="detail-field detail-field--full"><span className="detail-field__label">Coverage Details</span><span className="detail-field__value">{normalizedSelected.coverageDetails}</span></div>
                  </div>
                  <div className="policy-detail__actions">
                    <button className="detail-btn detail-btn--outline" onClick={() => generatePolicyPDF(normalizedSelected)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Download Policy
                    </button>
                    <button className="detail-btn detail-btn--ghost" onClick={() => onNavigate?.('claims')}>File a Claim</button>
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