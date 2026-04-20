import React, { useState } from 'react'
import './ProposalForm.css'
import { submitProposal } from '../lib/api'
import { trackSubmittedProposal } from '../lib/proposal-store'

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

const CB = ({ label, checked, onChange }) => (
  <label className="checkbox-item">
    <input type="checkbox" checked={checked} onChange={onChange} />
    {label}
  </label>
)

export default function MotorProposalForm({ onBack, onNavigate, templateId, user, product, missingProfileFields = [], onProposalSubmitted }) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [declared, setDeclared] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [form, setForm] = useState({
    licenseNumber: '',
    licenseIssueDate: '',
    purchaseDate: '',
    vehicleState: '',       // 'new' | 'secondhand'
    goodCondition: '',      // 'yes' | 'no'
    fuelType: '',           // 'petrol' | 'diesel' | 'electric'
    antiTheft: '',          // 'yes' | 'no'
    dayParking: [],
    nightParking: [],
    pastAccidents: '',      // 'yes' | 'no'
  })

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const toggleArr = (key, val) =>
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(val) ? prev[key].filter(x => x !== val) : [...prev[key], val],
    }))

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
        licenseNumber: form.licenseNumber,
        licenseIssueDate: form.licenseIssueDate,
        purchaseDate: form.purchaseDate,
        vehicleState: form.vehicleState,
        goodCondition: form.goodCondition,
        fuelType: form.fuelType,
        antiTheft: form.antiTheft,
        dayParking: form.dayParking.join(', '),
        nightParking: form.nightParking.join(', '),
        pastAccidents: form.pastAccidents,
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
      setSubmitError(err.message || 'Submission failed.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return <SuccessScreen onBack={() => onNavigate('overview')} />

  const DAY_OPTIONS = ['Public Parking', 'Covered Parking Lot', 'Open Parking Lot', 'Roadside']
  const NIGHT_OPTIONS = ['Public Parking', 'Covered Parking Lot', 'Open Parking Lot', 'Roadside']

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
          <p className="proposal-form__title">Motor Vehicle Insurance Proposal Form</p>
        </div>

        <div className="proposal-form__notice">
          <strong>IMPORTANT:—</strong>The purpose of this Proposal Form is to provide the Company with all the material information that is likely to influence the assessment of your Proposal. When filling the form you should complete all questions fully. Where you are in doubt as to whether a particular piece of information is material, you should include it. Failure to disclose all facts may invalidate the cover under your Policy.
        </div>

        {submitError && (
          <div className="proposal-form__notice" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2', color: '#b91c1c' }}>
            {submitError}
          </div>
        )}

        {/* License Information */}
        <div className="form-section">
          <p className="form-section__title">License Information</p>
          <div className="form-grid">
            <div className="form-field">
              <label>License Number</label>
              <input className="form-input" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} />
            </div>
            <div className="form-field">
              <label>License Issue Date</label>
              <input className="form-input" type="date" value={form.licenseIssueDate} onChange={e => set('licenseIssueDate', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="form-section">
          <p className="form-section__title">Vehicle Information</p>

          <div className="form-grid" style={{ marginBottom: 16 }}>
            <div className="form-field">
              <label>Date of purchase of the vehicle</label>
              <input className="form-input" type="date" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} />
            </div>
            <div className="form-field">
              <label>State of vehicle during purchase</label>
              <div className="checkbox-group checkbox-group--2" style={{ marginTop: 8 }}>
                <CB label="New" checked={form.vehicleState === 'new'} onChange={() => set('vehicleState', 'new')} />
                <CB label="Second hand" checked={form.vehicleState === 'secondhand'} onChange={() => set('vehicleState', 'secondhand')} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <span className="inline-label">Is the vehicle in good condition</span>
            <div className="checkbox-group checkbox-group--2">
              <CB label="Yes" checked={form.goodCondition === 'yes'} onChange={() => set('goodCondition', 'yes')} />
              <CB label="No" checked={form.goodCondition === 'no'} onChange={() => set('goodCondition', 'no')} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <span className="inline-label">Type of fuel use</span>
            <div className="checkbox-group checkbox-group--4">
              {['Petrol', 'Diesel', 'Electric'].map(f => (
                <CB key={f} label={f} checked={form.fuelType === f.toLowerCase()} onChange={() => set('fuelType', f.toLowerCase())} />
              ))}
            </div>
          </div>

          <div>
            <span className="inline-label">Is the vehicle fitted with Anti-theft device</span>
            <div className="checkbox-group checkbox-group--2">
              <CB label="Yes" checked={form.antiTheft === 'yes'} onChange={() => set('antiTheft', 'yes')} />
              <CB label="No" checked={form.antiTheft === 'no'} onChange={() => set('antiTheft', 'no')} />
            </div>
          </div>
        </div>

        {/* Parking Information */}
        <div className="form-section">
          <p className="form-section__title">Parking Information</p>

          <div className="form-grid" style={{ marginBottom: 16 }}>
            <div>
              <span className="inline-label">During daytime</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {DAY_OPTIONS.map(o => (
                  <CB key={o} label={o} checked={form.dayParking.includes(o)} onChange={() => toggleArr('dayParking', o)} />
                ))}
              </div>
            </div>
            <div>
              <span className="inline-label">During night</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {NIGHT_OPTIONS.map(o => (
                  <CB key={o} label={o} checked={form.nightParking.includes(o)} onChange={() => toggleArr('nightParking', o)} />
                ))}
              </div>
            </div>
          </div>

          <div>
            <span className="inline-label">Any past records of accidents?</span>
            <div className="checkbox-group checkbox-group--2">
              <CB label="Yes" checked={form.pastAccidents === 'yes'} onChange={() => set('pastAccidents', 'yes')} />
              <CB label="No" checked={form.pastAccidents === 'no'} onChange={() => set('pastAccidents', 'no')} />
            </div>
          </div>
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
