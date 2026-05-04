import React, { useState } from 'react'
import './ProposalForm.css'
import { submitProposal } from '../lib/api'
import { trackSubmittedProposal } from '../lib/proposal-store'

const PROPERTY_TYPES = ['House', 'Apartment', 'Commercial', 'Warehouse']
const CONSTRUCTION_TYPES = ['Concrete', 'Wood', 'Mixed']
const COVERAGE_TYPES = ['Fire', 'Theft', 'Natural Disaster', 'All Risk']

function SuccessScreen({ onBack }) {
  return (
    <div className="success-screen">
      <div className="success-card">
        <div className="success-card__icon">✔</div>
        <p className="success-card__title">Proposal Submitted Successfully</p>
        <p className="success-card__subtitle">It may take a while to verify your proposal</p>
        <button className="success-card__back" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}

export default function TravelProposalForm({ onBack, onNavigate, templateId, user, product, missingProfileFields = [], onProposalSubmitted }) {

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [declared, setDeclared] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [form, setForm] = useState({
    propertyType: '',
    address: '',
    yearBuilt: '',
    constructionType: '',
    usage: '',
    propertyValue: '',
    contentsValue: '',
    coverageType: '',
    securityMeasures: '',
    previousClaims: '',
  })

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    if (missingProfileFields.length > 0) {
      setSubmitError(`Complete your profile before submitting. Missing: ${missingProfileFields.join(', ')}`)
      return
    }

    if (!templateId) {
      setSubmitError('Missing policy template.')
      return
    }

    if (!declared) {
      setSubmitError('Please accept the declaration before submitting.')
      return
    }

    setLoading(true)
    setSubmitError('')

    try {
      const attributes = {
        ...form,
        declared: 'true',
      }

      const response = await submitProposal(templateId, attributes)

      trackSubmittedProposal({
        ownerEmail: user?.email,
        template: product?.template,
        proposalWithAttributes: response?.data?.proposalWithAttributes,
      })

      await onProposalSubmitted?.()
      setSubmitted(true)

    } catch (err) {
      setSubmitError(err.message || 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return <SuccessScreen onBack={() => onNavigate('overview')} />

  return (
    <div className="proposal-page">

      <button className="proposal-page__back" onClick={onBack}>
        ←
      </button>

      <div className="proposal-form-wrap">

        <div className="proposal-form__header">
          <div className="proposal-form__logo">
            <div className="proposal-form__logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className="proposal-form__logo-text">ChainSure Private Limited</span>
          </div>
          <p className="proposal-form__title">Property Insurance Proposal Form</p>
        </div>

        <div className="proposal-form__notice">
          <strong>IMPORTANT:—</strong> Provide complete and accurate details of your property. Failure to disclose material facts may invalidate your policy.
        </div>

        {submitError && (
          <div className="proposal-form__notice" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2', color: '#b91c1c' }}>
            {submitError}
          </div>
        )}

        {/* Property Details */}
        <div className="form-section">
          <p className="form-section__title">Property Details</p>

          <div className="form-grid">
            <div className="form-field">
              <label>Property Address</label>
              <input className="form-input" name="address" value={form.address} onChange={handleChange} />
            </div>

            <div className="form-field">
              <label>Property Type</label>
              <select className="form-input" name="propertyType" value={form.propertyType} onChange={handleChange}>
                <option value="">Select</option>
                {PROPERTY_TYPES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            <div className="form-field">
              <label>Year Built</label>
              <input className="form-input" name="yearBuilt" value={form.yearBuilt} onChange={handleChange} />
            </div>

            <div className="form-field">
              <label>Construction Type</label>
              <select className="form-input" name="constructionType" value={form.constructionType} onChange={handleChange}>
                <option value="">Select</option>
                {CONSTRUCTION_TYPES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-field form-field--full">
              <label>Usage</label>
              <input className="form-input" name="usage" placeholder="Residential / Rental / Business" value={form.usage} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Coverage */}
        <div className="form-section">
          <p className="form-section__title">Coverage Details</p>

          <div className="form-grid">
            <div className="form-field">
              <label>Property Value</label>
              <input className="form-input" name="propertyValue" value={form.propertyValue} onChange={handleChange} />
            </div>

            <div className="form-field">
              <label>Contents Value</label>
              <input className="form-input" name="contentsValue" value={form.contentsValue} onChange={handleChange} />
            </div>

            <div className="form-field form-field--full">
              <label>Coverage Type</label>
              <select className="form-input" name="coverageType" value={form.coverageType} onChange={handleChange}>
                <option value="">Select</option>
                {COVERAGE_TYPES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Risk Info */}
        <div className="form-section">
          <p className="form-section__title">Risk Information</p>

          <div className="form-field">
            <label>Security Measures</label>
            <textarea className="form-textarea" name="securityMeasures" value={form.securityMeasures} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label>Previous Claims History</label>
            <textarea className="form-textarea" name="previousClaims" value={form.previousClaims} onChange={handleChange} />
          </div>
        </div>

        {/* Declaration */}
        <div className="form-declaration">
          <input type="checkbox" checked={declared} onChange={e => setDeclared(e.target.checked)} />
          <span>
            I declare that all information provided is true and accurate. I understand that false information may lead to policy rejection.
          </span>
        </div>

        <button className="form-submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>

      </div>
    </div>
  )
}