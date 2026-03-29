import React, { useState } from 'react'
import './ProposalForm.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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

const YesNo = ({ label, value, onChange }) => (
  <div style={{ marginBottom: 14 }}>
    <span className="inline-label">{label}</span>
    <div className="checkbox-group checkbox-group--2">
      <label className="checkbox-item">
        <input type="checkbox" checked={value === 'yes'} onChange={() => onChange('yes')} />
        Yes
      </label>
      <label className="checkbox-item">
        <input type="checkbox" checked={value === 'no'} onChange={() => onChange('no')} />
        No
      </label>
    </div>
  </div>
)

const MEDICAL_HISTORY = [
  { key: 'heartDisease', label: 'Heart disease or cardiovascular conditions?' },
  { key: 'highBP', label: 'High blood pressure(Hypertension)' },
  { key: 'diabetes', label: 'Diabetes (Type 1 or Type 2)' },
  { key: 'cancer', label: 'Cancer or tumors' },
  { key: 'respiratory', label: 'Respiratory conditions(Asthma, COPD)' },
  { key: 'kidneyLiver', label: 'Kidney or liver disease' },
  { key: 'mentalHealth', label: 'Mental health conditions' },
  { key: 'neurological', label: 'Neurological disorders' },
]

export default function LifeProposalForm({ onBack, onNavigate, templateId }) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [declared, setDeclared] = useState(false)

  const [form, setForm] = useState({
    heightCm: '',
    weightKg: '',
    smoke: '',
    alcohol: '',
    tobacco: '',
    heartDisease: '',
    highBP: '',
    diabetes: '',
    cancer: '',
    respiratory: '',
    kidneyLiver: '',
    mentalHealth: '',
    neurological: '',
  })

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = async () => {
    if (!templateId) {
      alert('Missing policy template. Return to the marketplace and open this form again.')
      return
    }
    if (!declared) { alert('Please accept the declaration before submitting.'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/proposal/${templateId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          attributes: {
            ...form,
            declared: 'true',
          }
        }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        let msg = 'Submission failed.'
        try {
          const data = await res.json()
          msg = data?.error?.message || data?.message || msg
        } catch (_) {}
        alert(msg)
      }
    } catch (err) {
      console.warn('API not reachable:', err.message)
      alert(`Could not connect to the server (${API_BASE}). Check that the server is running and VITE_API_URL is correct.`)
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
          <p className="proposal-form__title">Life Insurance Proposal Form</p>
        </div>

        <div className="proposal-form__notice">
          <strong>IMPORTANT:—</strong>The purpose of this Proposal Form is to provide the Company with all the material information that is likely to influence the assessment of your Proposal. When filling the form you should complete all questions fully. Where you are in doubt as to whether a particular piece of information is material, you should include it. Failure to disclose all facts may invalidate the cover under your Policy.
        </div>

        {/* BMI */}
        <div className="form-section">
          <p className="form-section__title">BMI</p>
          <div className="form-grid">
            <div className="form-field">
              <label>Height(cm)</label>
              <input className="form-input" type="number" value={form.heightCm} onChange={e => set('heightCm', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Weight(kg)</label>
              <input className="form-input" type="number" value={form.weightKg} onChange={e => set('weightKg', e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="form-grid">
              <div>
                <YesNo label="Do you smoke?" value={form.smoke} onChange={v => set('smoke', v)} />
              </div>
              <div>
                <YesNo label="Do you consume alcohol?" value={form.alcohol} onChange={v => set('alcohol', v)} />
              </div>
            </div>
            <YesNo label="Do you consume tobacco?" value={form.tobacco} onChange={v => set('tobacco', v)} />
          </div>
        </div>

        {/* Medical History */}
        <div className="form-section">
          <p className="form-section__title">Medical History</p>
          <div className="form-grid">
            {MEDICAL_HISTORY.map(({ key, label }) => (
              <YesNo key={key} label={label} value={form[key]} onChange={v => set(key, v)} />
            ))}
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