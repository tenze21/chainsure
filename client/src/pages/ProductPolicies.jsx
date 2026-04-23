import React from 'react'
import { useParams } from 'react-router-dom'
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
  return [template?.name, template?.category?.name, template?.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function getTemplateKind(template) {
  const source = buildSearchSource(template)
  if (/(vehicle|motor|auto|car|fleet)/.test(source)) return 'motor'
  if (/(travel|trip)/.test(source)) return 'travel'
  if (/(property|home|landlord|premises|rental)/.test(source)) return 'property'
  return 'life'
}

function matchesProduct(template, product) {
  if (!product) {
    return false
  }

  const source = buildSearchSource(template)
  const tokenSet = new Set(source.split(/[^a-z0-9]+/).filter(Boolean))
  const matchers = Array.isArray(product.templateMatchers) ? product.templateMatchers : []

  if (matchers.length > 0) {
    return matchers.some((matcher) => {
      const normalizedMatcher = String(matcher).trim().toLowerCase()
      if (!normalizedMatcher) {
        return false
      }

      if (normalizedMatcher.includes(' ')) {
        return source.includes(normalizedMatcher)
      }

      // Match full tokens only to avoid false positives like "car" in "care".
      return tokenSet.has(normalizedMatcher)
    })
  }

  // Fallback by inferred template kind when no explicit matcher is configured.
  const kind = getTemplateKind(template)
  return (kind === 'property' ? 'travel' : kind) === product.key
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

export default function ProductPolicies({
  onNavigate,
  onSignOut,
  user,
  currentPageLabel,
  products,
  templates = [],
  catalogLoading,
  profileReady,
}) {
  const { productKey = '' } = useParams()
  const selectedProduct = products.find((product) => product.key === productKey) || null
  const scopedTemplates = (Array.isArray(templates) ? templates : []).filter((template) => matchesProduct(template, selectedProduct))

  return (
    <div className="layout">
      <Sidebar activePage="marketplace" onNavigate={onNavigate} onSignOut={onSignOut} />
      <div className="layout__main">
        <Topbar onNavigate={onNavigate} user={user} currentPageLabel={currentPageLabel} />
        <main className="marketplace">
          <div className="marketplace__header">
            <div>
              <h1 className="marketplace__title">{selectedProduct?.fallbackName || 'Product'} Policies</h1>
              <p className="marketplace__subtitle">Showing policies related to this insurance product only.</p>
            </div>
            <button className="marketplace__filter-btn" onClick={() => onNavigate('marketplace')}>
              Back to Products
            </button>
          </div>

          {!profileReady && (
            <div className="marketplace__notice">
              Complete your profile before opening proposal forms.
            </div>
          )}

          <div className="marketplace__grid">
            {scopedTemplates.map((template) => {
              const route = selectedProduct?.route || ''
              const canOpen = Boolean(route)
              return (
                <div key={template.id} className="product-card">
                  <div className="product-card__icon-wrap">{ICONS[productKey === 'travel' ? 'property' : productKey] || ICONS.life}</div>
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
                      if (!profileReady) {
                        onNavigate('profile')
                        return
                      }
                      if (!canOpen) return
                      onNavigate(route, { templateId: template.id })
                    }}
                    disabled={catalogLoading || !canOpen}
                  >
                    {!profileReady ? 'Complete Profile' : (canOpen ? 'Open Proposal Form' : 'Unavailable')}
                  </button>
                </div>
              )
            })}
          </div>
          {!catalogLoading && scopedTemplates.length === 0 && (
            <p className="product-card__note">No templates available for this product yet.</p>
          )}
        </main>
      </div>
    </div>
  )
}
