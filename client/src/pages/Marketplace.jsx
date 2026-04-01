import React from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import './Marketplace.css'
import { formatCurrency, formatPaymentType } from '../lib/formatters'

const ICONS = {
  life: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>),
  travel: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012.86 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>),
  motor: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>),
}

function getProductFeatures(product) {
  if (!product.template) {
    return product.fallbackFeatures
  }

  return [
    product.template.category?.name || 'Uncategorized template',
    formatPaymentType(product.template),
    product.template.duration ? `${product.template.duration} day duration` : 'No fixed duration in template',
  ]
}

function getProductCoverage(product) {
  if (!product.template) {
    return product.templateId ? 'Template configured but not loaded' : 'Template ID not configured yet'
  }

  return `Up to ${formatCurrency(product.template.coverageAmount)}`
}

function getButtonLabel(product, loading) {
  if (loading) {
    return 'Loading template...'
  }

  if (product.templateStatus === 'ready') {
    return 'Open Proposal Form'
  }

  if (product.templateStatus === 'error') {
    return 'Template Unavailable'
  }

  return 'Set Template ID'
}

export default function Marketplace({
  onNavigate,
  onSignOut,
  user,
  currentPageLabel,
  products,
  catalogLoading,
  catalogError,
  profileReady,
  missingProfileFields,
}) {
  const connectedCount = products.filter((product) => product.templateStatus === 'ready').length
  const missingFieldsLabel = missingProfileFields.join(', ')

  return (
    <div className="layout">
      <Sidebar activePage="marketplace" onNavigate={onNavigate} onSignOut={onSignOut} />
      <div className="layout__main">
        <Topbar onNavigate={onNavigate} user={user} currentPageLabel={currentPageLabel} />
        <main className="marketplace">
          <div className="marketplace__header">
            <div>
              <h1 className="marketplace__title">Insurance Marketplace</h1>
              <p className="marketplace__subtitle">
                Each card below points to one client-side proposal form and one backend template ID.
              </p>
            </div>
            <button className="marketplace__filter-btn" disabled>
              {connectedCount}/{products.length} connected
            </button>
          </div>

          {!profileReady && (
            <div className="marketplace__notice">
              Complete your profile before applying. The backend requires {missingFieldsLabel}.
            </div>
          )}
          {catalogError && <div className="marketplace__notice">{catalogError}</div>}

          <div className="marketplace__grid">
            {products.map((product) => (
              <div key={product.key} className="product-card">
                <div className="product-card__icon-wrap">{ICONS[product.key]}</div>
                <h3 className="product-card__name">{product.template?.name || product.fallbackName}</h3>
                <p className="product-card__coverage">{getProductCoverage(product)}</p>
                <ul className="product-card__features">
                  {getProductFeatures(product).map((feature, index) => (
                    <li key={`${product.key}-${index}`} className="product-card__feature">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className="product-card__btn"
                  onClick={() => {
                    if (!profileReady) {
                      onNavigate('profile')
                      return
                    }

                    onNavigate(product.route)
                  }}
                  disabled={catalogLoading || product.templateStatus !== 'ready'}
                >
                  {!profileReady && product.templateStatus === 'ready'
                    ? 'Complete Profile'
                    : getButtonLabel(product, catalogLoading)}
                </button>
                {product.templateStatus === 'ready' && product.templateSource === 'auto' && (
                  <p className="product-card__note">Matched automatically from the live backend template list.</p>
                )}
                {product.templateStatus === 'error' && (
                  <p className="product-card__note">{product.templateError}</p>
                )}
                {product.templateStatus === 'missing' && (
                  <p className="product-card__note">No matching backend template exists for this form yet.</p>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
