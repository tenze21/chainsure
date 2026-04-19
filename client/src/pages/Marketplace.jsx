import React from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import './Marketplace.css'
import { formatCurrency, formatPaymentType } from '../lib/formatters'

const ICONS = {
  life: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>),
  travel: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012.86 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>),
  motor: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>),
  default: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l7 4v6c0 5-3.58 8.59-7 10-3.42-1.41-7-5-7-10V6l7-4z" /></svg>),
}

function getTemplateCategory(template) {
  return template.category?.name || template.categoryName || 'Uncategorized'
}

function getTemplateIcon(template) {
  const category = getTemplateCategory(template).toLowerCase()

  if (category.includes('health') || category.includes('life') || category.includes('medical')) {
    return ICONS.life
  }

  if (category.includes('travel') || category.includes('trip') || category.includes('journey') || category.includes('holiday')) {
    return ICONS.travel
  }

  if (category.includes('vehicle') || category.includes('motor') || category.includes('auto') || category.includes('car') || category.includes('fleet')) {
    return ICONS.motor
  }

  return ICONS.default
}

function getProposalRoute(template) {
  const source = [
    template.name,
    getTemplateCategory(template),
    template.description,
    template.coverageDetails,
    template.eligibility,
    template.limitations,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (
    source.includes('travel')
    || source.includes('trip')
    || source.includes('holiday')
    || source.includes('vacation')
    || source.includes('journey')
  ) {
    return 'proposal-travel'
  }

  if (
    source.includes('vehicle')
    || source.includes('motor')
    || source.includes('auto')
    || source.includes('car')
    || source.includes('bike')
    || source.includes('fleet')
    || source.includes('transport')
  ) {
    return 'proposal-motor'
  }

  if (
    source.includes('health')
    || source.includes('life')
    || source.includes('medical')
    || source.includes('critical')
    || source.includes('family')
    || source.includes('care')
    || source.includes('illness')
  ) {
    return 'proposal-life'
  }

  return null
}

function getTemplateFeatures(template) {
  return [
    getTemplateCategory(template),
    formatPaymentType(template),
    template.duration ? `${template.duration} day duration` : 'No fixed duration in template',
  ]
}

function getTemplateCoverage(template) {
  return `Up to ${formatCurrency(template.coverageAmount)}`
}

export default function Marketplace({
  onNavigate,
  onSignOut,
  user,
  currentPageLabel,
  products,
  templates,
  catalogLoading,
  catalogError,
  profileReady,
  missingProfileFields,
}) {
  const templateCount = templates.length
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
                Each card below shows a backend policy template created by the admin.
              </p>
            </div>
            <button className="marketplace__filter-btn" disabled>
              {templateCount} templates
            </button>
          </div>

          {!profileReady && (
            <div className="marketplace__notice">
              Complete your profile before applying. The backend requires {missingFieldsLabel}.
            </div>
          )}
          {catalogError && <div className="marketplace__notice">{catalogError}</div>}

          <div className="marketplace__grid">
            {templates.length === 0 ? (
              <div className="marketplace__notice">No policy templates are available yet.</div>
            ) : templates.map((template) => {
              const routeKey = getProposalRoute(template)
              const routeFragment = routeKey ? routeKey.replace('proposal-', '') : null
              const templatePath = routeFragment ? `/dashboard/proposals/${routeFragment}?templateId=${template.id}` : null
              const buttonLabel = !routeFragment
                ? 'Form unavailable'
                : !profileReady
                  ? 'Complete Profile'
                  : 'Open Proposal Form'

              return (
                <div key={template.id} className="product-card">
                  <div className="product-card__icon-wrap">{getTemplateIcon(template)}</div>
                  <h3 className="product-card__name">{template.name || 'Unnamed template'}</h3>
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

                      if (templatePath) {
                        onNavigate(templatePath)
                      }
                    }}
                    disabled={catalogLoading || !templatePath}
                  >
                    {buttonLabel}
                  </button>
                  {!templatePath && (
                    <p className="product-card__note">No matching proposal form is available for this template yet.</p>
                  )}
                  {templatePath && (
                    <p className="product-card__note">Matched automatically from the live backend template list.</p>
                  )}
                </div>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}
