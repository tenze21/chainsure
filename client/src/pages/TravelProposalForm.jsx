import React, { useState } from 'react'
import './ProposalForm.css'
import { submitProposal } from '../lib/api'
import { trackSubmittedProposal } from '../lib/proposal-store'

const TRAVEL_PURPOSES = ['Business', 'Vacation', 'Sports', 'Adventure', 'Pilgrimage', 'Pleasure', 'Others(Specify)']

function SuccessScreen({ onBack }) {
  return (
    <div className="success-screen">
      <div className="success-card">
        <div className="success-card__icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p className="success-card__title">Proposal Submitted Successfully</p>
        <p className="success-card__subtitle">It may take a while to verify your proposal</p>
        <button className="success-card__back" onClick={onBack}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
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
  const [purposes, setPurposes] = useState([])
  const [specifyText, setSpecifyText] = useState('')
  const [form, setForm] = useState({
    destination: '',
    travelers: '',
    departureDate: '',
    duration: '',
    healthCondition: '',
  })

  const togglePurpose = (p) =>
    setPurposes(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    if (missingProfileFields.length > 0) {
      setSubmitError(`Complete your profile before submitting. Missing: ${missingProfileFields.join(', ')}.`)
      return
    }

    if (!templateId) {
      setSubmitError('Missing policy template. Return to the marketplace and open this form again.')
      return
    }
    if (!declared) {
      setSubmitError('Please accept the declaration before submitting.')
      return
    }

    setSubmitError('')
    setLoading(true)
    try {
      const attributes = {
        travelPurpose: purposes.join(', '),
        specifyOther: specifyText,
        travelDestination: form.destination,
        numberOfTravelers: form.travelers,
        departureDate: form.departureDate,
        travelDuration: form.duration,
        healthCondition: form.healthCondition,
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
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
          <p className="proposal-form__title">Travel Insurance Proposal Form</p>
        </div>

        <div className="proposal-form__notice">
          <strong>IMPORTANT:—</strong>The purpose of this Proposal Form is to provide the Company with all the material information that is likely to influence the assessment of your Proposal. When filling the form you should complete all questions fully. Where you are in doubt as to whether a particular piece of information is material, you should include it. Failure to disclose all facts may invalidate the cover under your Policy.
        </div>

        {submitError && (
          <div className="proposal-form__notice" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2', color: '#b91c1c' }}>
            {submitError}
          </div>
        )}

        {/* Travel Purpose */}
        <div className="form-section">
          <p className="form-section__title">Travel Purpose</p>
          <div className="checkbox-group">
            {TRAVEL_PURPOSES.map(p => (
              <label key={p} className="checkbox-item">
                <input type="checkbox" checked={purposes.includes(p)} onChange={() => togglePurpose(p)} />
                {p}
              </label>
            ))}
          </div>
          <div className="form-field">
            <label>Specify here</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: 70 }}
              placeholder="Specify here..."
              value={specifyText}
              onChange={e => setSpecifyText(e.target.value)}
            />
          </div>
        </div>

        {/* Travel Details */}
        <div className="form-section">
          <p className="form-section__title">Travel Details</p>
          <div className="form-grid">
            <div className="form-field">
              <label>Travel Destination</label>
              <input className="form-input" name="destination" placeholder="Country, State" value={form.destination} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Number of Travelers</label>
              <input className="form-input" name="travelers" type="number" min="1" value={form.travelers} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Departure Date</label>
              <input className="form-input" name="departureDate" type="date" value={form.departureDate} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Travel Duration</label>
              <input className="form-input" name="duration" placeholder="Travel duration in days" value={form.duration} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Health Condition */}
        <div className="form-section">
          <p className="form-section__title">Health Condition</p>
          <p className="form-section__subtitle">Please specify any preexisting medical conditions that you have.</p>
          <textarea
            className="form-textarea"
            name="healthCondition"
            value={form.healthCondition}
            onChange={handleChange}
            style={{ minHeight: 110 }}
          />
        </div>

        {/* Declaration */}
        <div className="form-declaration">
          <input type="checkbox" checked={declared} onChange={e => setDeclared(e.target.checked)} />
          <span>I declare that all information provided is true and accurate to the best of my knowledge. I understand that providing false information may result in denial of coverage or policy cancellation. I consent to the admin reviewing my health details to determine my premium.</span>
        </div>

        <button className="form-submit-btn" onClick={handleSubmit} disabled={loading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </div>
  )
}
