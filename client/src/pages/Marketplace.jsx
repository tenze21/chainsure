import React from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import './Marketplace.css'
import { formatCurrency, formatPaymentType } from '../lib/formatters'

const ICONS = {
  life: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>),
  travel: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012.86 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>),
  motor: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>),
  property: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M9 20v-6h6v6" /></svg>),
}

function buildSearchSource(template) {
  return [
    template?.name,
    template?.category?.name,
    template?.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function getTemplateKind(template) {
  const source = buildSearchSource(template)

  if (/(vehicle|motor|auto|car|fleet)/.test(source)) {
    return 'motor'
  }

  if (/(travel|trip)/.test(source)) {
    return 'travel'
  }

  if (/(property|home|landlord|premises|rental)/.test(source)) {
    return 'property'
  }

  return 'life'
}

function getTemplateRoute(template) {
  const kind = getTemplateKind(template)

  if (kind === 'life') {
    return 'proposal-life'
  }

  if (kind === 'motor') {
    return 'proposal-motor'
  }

  if (kind === 'travel') {
    return 'proposal-travel'
  }

  return ''
}

function getTemplateFeatures(template) {
  return [
    template?.category?.name || 'General insurance',
    formatPaymentType(template),
    template?.duration ? `${template.duration} day duration` : 'Flexible duration',
  ]
}

function getTemplateCoverage(template) {
  return `Up to ${formatCurrency(template?.coverageAmount)}`
}

function getProductFeatures(product) {
  if (!product.template) {
    return product.fallbackFeatures
  }

  return getTemplateFeatures(product.template)
}

function getProductCoverage(product) {
  if (!product.template) {
    return 'Coverage details unavailable'
  }

  return getTemplateCoverage(product.template)
}

function getProductButtonLabel(product, loading) {
  if (loading) {
    return 'Loading product...'
  }

  if (product.templateStatus === 'ready') {
    return 'Open Proposal Form'
  }

  if (product.templateStatus === 'error') {
    return 'Product Unavailable'
  }

  return 'Unavailable'
}

function getTemplateButtonLabel(template, loading, profileReady) {
  if (loading) {
    return 'Loading products...'
  }

  if (!getTemplateRoute(template)) {
    return 'Unavailable'
  }

  if (!profileReady) {
    return 'Complete Profile'
  }

  return 'Open Proposal Form'
}

export default function Marketplace({
  onNavigate,
  onSignOut,
  user,
  currentPageLabel,
  products,
  templates = [],
  catalogLoading,
  profileReady,
  missingProfileFields,
}) {
<<<<<<< HEAD
=======
  // const connectedCount = products.filter((product) => product.templateStatus === 'ready').length
>>>>>>> e0e9fd6366f1770b8ca990d71d22699eb191eb2e
  const missingFieldsLabel = missingProfileFields.join(', ')
  const liveTemplates = Array.isArray(templates) ? templates : []
  const liveTemplateCount = liveTemplates.length
  const formReadyCount = liveTemplates.filter((template) => getTemplateRoute(template)).length
  const connectedCount = products.filter((product) => product.templateStatus === 'ready').length
  const showLiveProducts = liveTemplateCount > 0

  return (
    <div className="layout">
      <Sidebar activePage="marketplace" onNavigate={onNavigate} onSignOut={onSignOut} />
      <div className="layout__main">
        <Topbar onNavigate={onNavigate} user={user} currentPageLabel={currentPageLabel} />
        <main className="marketplace">
          <div className="marketplace__header">
            <div>
              <h1 className="marketplace__title">Insurance Marketplace</h1>
<<<<<<< HEAD
              <p className="marketplace__subtitle">
                Choose a product and open its proposal form.
              </p>
            </div>
            <button className="marketplace__filter-btn" disabled>
              {catalogLoading
                ? 'Loading products'
                : showLiveProducts
                  ? `${formReadyCount}/${liveTemplateCount} available`
                  : `${connectedCount}/${products.length} available`}
            </button>
=======
              {/* <p className="marketplace__subtitle">
                Each card below points to one client-side proposal form and one backend template ID.
              </p> */}
            </div>
            {/* <button className="marketplace__filter-btn" disabled>
              {connectedCount}/{products.length} connected
            </button> */}
>>>>>>> e0e9fd6366f1770b8ca990d71d22699eb191eb2e
          </div>

          {!profileReady && (
            <div className="marketplace__notice">
              Complete your profile before applying. Missing: {missingFieldsLabel}.
            </div>
          )}

          <div className="marketplace__grid">
            {showLiveProducts
              ? liveTemplates.map((template) => {
                const kind = getTemplateKind(template)
                const route = getTemplateRoute(template)
                const canOpen = Boolean(route)

<<<<<<< HEAD
                return (
                  <div key={template.id} className="product-card">
                    <div className="product-card__icon-wrap">{ICONS[kind] || ICONS.life}</div>
                    <h3 className="product-card__name">{template.name}</h3>
                    <p className="product-card__coverage">{getTemplateCoverage(template)}</p>
                    <ul className="product-card__features">
                      {getTemplateFeatures(template).map((feature, index) => (
                        <li key={`${template.id}-${index}`} className="product-card__feature">
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
                        if (!canOpen) {
                          return
                        }

                        if (!profileReady) {
                          onNavigate('profile')
                          return
                        }

                        onNavigate(route, { templateId: template.id })
                      }}
                      disabled={catalogLoading || !canOpen}
                    >
                      {getTemplateButtonLabel(template, catalogLoading, profileReady)}
                    </button>
                    <p className="product-card__note">
                      {canOpen
                        ? 'Ready for application.'
                        : 'Applications are not available for this product yet.'}
                    </p>
                  </div>
                )
              })
              : products.map((product) => (
                <div key={product.key} className="product-card">
                  <div className="product-card__icon-wrap">{ICONS[product.key] || ICONS.life}</div>
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
                      : getProductButtonLabel(product, catalogLoading)}
                  </button>
                  {product.templateStatus === 'error' && (
                    <p className="product-card__note">This product is temporarily unavailable.</p>
                  )}
                  {product.templateStatus === 'missing' && (
                    <p className="product-card__note">Applications are not available for this product yet.</p>
                  )}
                </div>
              ))}
=======
                    onNavigate(product.route)
                  }}
                  disabled={catalogLoading || product.templateStatus !== 'ready'}
                >
                  {!profileReady && product.templateStatus === 'ready'
                    ? 'Complete Profile'
                    : getButtonLabel(product, catalogLoading)}
                </button>
                {/* {product.templateStatus === 'ready' && product.templateSource === 'auto' && (
                  <p className="product-card__note">Matched automatically from the live backend template list.</p>
                )}
                {product.templateStatus === 'error' && (
                  <p className="product-card__note">{product.templateError}</p>
                )}
                {product.templateStatus === 'missing' && (
                  <p className="product-card__note">No matching backend template exists for this form yet.</p>
                )} */}
              </div>
            ))}
>>>>>>> e0e9fd6366f1770b8ca990d71d22699eb191eb2e
          </div>
        </main>
      </div>
    </div>
  )
}
