import React, { useState, useRef, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import './UserProfile.css'

/* ─────────────────────────────────────────
   DEFAULT DATA  (swap with API data later)
───────────────────────────────────────── */
const DEFAULT_BASIC = {
  firstName: 'Tenzin',
  lastName: 'Choda',
  email: 'Tenzee@gmail.com',
  phone: '+975 17886654',
  dob: '1990-05-18',
  gender: 'Male',
  occupation: 'Software Engineer',
  address: 'Thimphu, Bhutan',
}
const DEFAULT_EMERGENCY = {
  firstName: 'Tashi',
  lastName: 'Pem',
  contact: '+975 17678754',
  relationship: 'Spouse',
}

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
function Toast({ msg, type, onClose }) {
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [msg])

  if (!msg) return null
  return (
    <div className={`toast toast--${type}`}>
      {type === 'success'
        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      }
      {msg}
    </div>
  )
}

/* ─────────────────────────────────────────
   CHANGE PASSWORD MODAL
───────────────────────────────────────── */
function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [show, setShow] = useState({ current: false, next: false, confirm: false })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const overlayRef = useRef()

  // close on overlay click
  const handleOverlay = (e) => { if (e.target === overlayRef.current) onClose() }

  const toggle = (f) => setShow(p => ({ ...p, [f]: !p[f] }))
  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setError('') }

  const validate = () => {
    if (!form.current) return 'Current password is required.'
    if (form.next.length < 8) return 'New password must be at least 8 characters.'
    if (form.next !== form.confirm) return 'Passwords do not match.'
    if (form.next === form.current) return 'New password must differ from current password.'
    return ''
  }

  const handleSave = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    try {
      // TODO: wire to PATCH /api/auth/change-password
      await new Promise(r => setTimeout(r, 900)) // simulated delay
      setSuccess(true)
      setTimeout(onClose, 1800)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const EyeIcon = ({ visible }) => visible
    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>

  const strength = (() => {
    const p = form.next
    if (!p) return null
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength] || ''
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#009956'][strength] || ''

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlay}>
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">Change Password</h2>
          <button className="modal__close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {success ? (
          <div className="modal__success">
            <div className="modal__success-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#009956" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <p className="modal__success-text">Password changed successfully!</p>
          </div>
        ) : (
          <>
            <div className="modal__body">
              {/* Current password */}
              {[
                { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
                { key: 'next',    label: 'New Password',     placeholder: 'Min. 8 characters' },
                { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="pf-field" style={{ marginBottom: 14 }}>
                  <label className="pf-field__label">{label}</label>
                  <div className="pw-input-wrap">
                    <input
                      className="form-input pw-input"
                      type={show[key] ? 'text' : 'password'}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={e => set(key, e.target.value)}
                    />
                    <button className="pw-eye" type="button" onClick={() => toggle(key)}>
                      <EyeIcon visible={show[key]} />
                    </button>
                  </div>
                  {/* strength bar for new password */}
                  {key === 'next' && form.next && (
                    <div style={{ marginTop: 6 }}>
                      <div className="strength-bar">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="strength-bar__seg" style={{ background: i <= strength ? strengthColor : '#e2e8f0' }} />
                        ))}
                      </div>
                      <span className="strength-label" style={{ color: strengthColor }}>{strengthLabel}</span>
                    </div>
                  )}
                </div>
              ))}

              {error && (
                <div className="modal__error">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}
            </div>

            <div className="modal__footer">
              <button className="pf-btn pf-btn--outline" onClick={onClose} disabled={loading}>Cancel</button>
              <button className="pf-btn pf-btn--primary" onClick={handleSave} disabled={loading}>
                {loading ? (
                  <span className="spinner" />
                ) : 'Update Password'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   PERSONAL TAB
───────────────────────────────────────── */
function PersonalTab() {
  const [basic, setBasic] = useState({ ...DEFAULT_BASIC })
  const [emergency, setEmergency] = useState({ ...DEFAULT_EMERGENCY })
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)

  const setB = (k, v) => { setBasic(p => ({ ...p, [k]: v })); setDirty(true); setSaved(false) }
  const setE = (k, v) => { setEmergency(p => ({ ...p, [k]: v })); setDirty(true); setSaved(false) }

  const handleReset = () => {
    setBasic({ ...DEFAULT_BASIC })
    setEmergency({ ...DEFAULT_EMERGENCY })
    setDirty(false)
    setSaved(false)
  }

  const handleSave = async () => {
    // TODO: PATCH /api/user/profile  { ...basic, emergency }
    await new Promise(r => setTimeout(r, 600))
    setDirty(false)
    setSaved(true)
  }

  const Field = ({ label, k, section, type = 'text', placeholder }) => {
    const val = section === 'basic' ? basic[k] : emergency[k]
    const setter = section === 'basic' ? setB : setE
    return (
      <div className="pf-field">
        <label className="pf-field__label">{label}</label>
        <input
          className="pf-field__input"
          type={type}
          value={val}
          placeholder={placeholder}
          onChange={e => setter(k, e.target.value)}
        />
      </div>
    )
  }

  return (
    <div className="pf-card">
      <div className="pf-card__section">
        <h3 className="pf-card__section-title">Basic Information</h3>
        <div className="pf-grid">
          <Field label="First Name"     k="firstName"   section="basic" />
          <Field label="Last Name"      k="lastName"    section="basic" />
          <Field label="Email Address"  k="email"       section="basic" type="email" />
          <Field label="Phone Number"   k="phone"       section="basic" />
          <Field label="Date of Birth"  k="dob"         section="basic" type="date" />
          <Field label="Gender"         k="gender"      section="basic" />
          <Field label="Occupation"     k="occupation"  section="basic" />
          <Field label="Address"        k="address"     section="basic" />
        </div>
      </div>

      <div className="pf-card__section" style={{ marginTop: 24 }}>
        <h3 className="pf-card__section-title">Emergency Contact</h3>
        <div className="pf-grid">
          <Field label="First Name"     k="firstName"    section="emergency" />
          <Field label="Last Name"      k="lastName"     section="emergency" />
          <Field label="Contact Number" k="contact"      section="emergency" />
          <Field label="Relationship"   k="relationship" section="emergency" />
        </div>
      </div>

      <div className="pf-card__actions">
        {saved && (
          <span className="save-success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#009956" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Changes saved
          </span>
        )}
        <button
          className="pf-btn pf-btn--outline"
          onClick={handleReset}
          disabled={!dirty}
          title="Discard changes"
        >
          Reset
        </button>
        <button
          className="pf-btn pf-btn--primary"
          onClick={handleSave}
          disabled={!dirty}
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   POLICIES TAB
───────────────────────────────────────── */
const POLICIES = [
  {
    id: 'travel', name: 'Travel Insurance', coverage: 'Nu. 10,00,000',
    premium: 'Nu. 25,00,000/year', nextPayment: 'Jan 10, 2025',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012.86 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  },
  {
    id: 'motor', name: 'Motor Insurance', coverage: 'Nu. 25,00,000',
    premium: 'Nu. 12,00,000/year', nextPayment: 'Mar 01, 2025',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  },
  {
    id: 'life', name: 'Life Insurance', coverage: 'Nu. 50,00,000',
    premium: 'Nu. 5,000/year', nextPayment: 'Dec 16, 2025',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  },
]

function PoliciesTab() {
  return (
    <div className="pf-card">
      <h3 className="pf-card__section-title" style={{ marginBottom: 16 }}>My Insurance Policies</h3>
      <div className="pf-policy-list">
        {POLICIES.map(p => (
          <div key={p.id} className="pf-policy-row">
            <div className="pf-policy-row__left">
              <div className="pf-policy-row__icon">{p.icon}</div>
              <div>
                <p className="pf-policy-row__name">{p.name}</p>
                <p className="pf-policy-row__coverage">Coverage {p.coverage}</p>
              </div>
            </div>
            <div className="pf-policy-row__mid">
              <p className="pf-policy-row__meta-label">Premium</p>
              <p className="pf-policy-row__meta-val">{p.premium}</p>
            </div>
            <div className="pf-policy-row__mid">
              <p className="pf-policy-row__meta-label">Next payment</p>
              <p className="pf-policy-row__meta-val">{p.nextPayment}</p>
            </div>
            <span className="pf-badge"><span className="pf-badge__dot" />Active</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   SECURITY TAB
───────────────────────────────────────── */
function SecurityTab() {
  const [walletOpen, setWalletOpen] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showPwModal, setShowPwModal] = useState(false)
  const [toast, setToast] = useState({ msg: '', type: 'success' })

  const copyAddress = () => {
    navigator.clipboard.writeText('0x5BE6....F9A3')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg: '', type: 'success' })} />
      {showPwModal && <ChangePasswordModal onClose={() => setShowPwModal(false)} />}

      {/* Password & Security */}
      <div className="pf-card" style={{ marginBottom: 20 }}>
        <h3 className="pf-card__section-title" style={{ marginBottom: 18 }}>Password & Security</h3>

        <div className="sec-row">
          <div>
            <p className="sec-row__title">Password</p>
            <p className="sec-row__sub">Last changed 30 days ago</p>
          </div>
          <button
            className="pf-btn pf-btn--outline pf-btn--sm"
            onClick={() => setShowPwModal(true)}
          >
            Change Password
          </button>
        </div>
        <div className="sec-divider" />

        <div className="sec-row">
          <div>
            <p className="sec-row__title">Two-factor Authentication</p>
            <p className="sec-row__sub">Add an extra layer of security</p>
          </div>
          <span className="sec-enabled-badge">Enabled</span>
        </div>
        <div className="sec-divider" />

        <div className="sec-row">
          <div>
            <p className="sec-row__title">Active Sessions</p>
            <p className="sec-row__sub">Manage your active login sessions</p>
          </div>
          <button
            className="pf-btn pf-btn--outline pf-btn--sm"
            onClick={() => setToast({ msg: 'Session management coming soon.', type: 'info' })}
          >
            View Sessions
          </button>
        </div>
        <div className="sec-divider" />

        <div className="sec-row">
          <div>
            <p className="sec-row__title">Login History</p>
            <p className="sec-row__sub">View your recent login activity</p>
          </div>
          <button
            className="pf-btn pf-btn--outline pf-btn--sm"
            onClick={() => setToast({ msg: 'Login history coming soon.', type: 'info' })}
          >
            View History
          </button>
        </div>
      </div>

      {/* Wallet */}
      <div className="pf-card">
        <button className="wallet-toggle" onClick={() => setWalletOpen(o => !o)}>
          <h3 className="pf-card__section-title" style={{ marginBottom: 0 }}>Wallet</h3>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: walletOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </button>

        {walletOpen && (
          <div style={{ marginTop: 18 }}>
            <div className="sec-divider" style={{ marginTop: 0, marginBottom: 16 }} />
            <div className="wallet-row">
              <span className="wallet-row__label">Wallet Address</span>
              <div className="wallet-row__val">
                <span className="wallet-address">0x5BE6....F9A3</span>
                <button className="wallet-copy" onClick={copyAddress} title="Copy address">
                  {copied
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#009956" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  }
                </button>
              </div>
            </div>
            <div className="sec-divider" />
            <div className="wallet-row">
              <span className="wallet-row__label">Private Key</span>
              <button className="pf-btn pf-btn--outline pf-btn--sm" style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                View Private Key
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

/* ─────────────────────────────────────────
   MAIN
───────────────────────────────────────── */
export default function UserProfile({ onNavigate }) {
  const [tab, setTab] = useState('personal')

  return (
    <div className="layout">
      <Sidebar activePage="profile" onNavigate={onNavigate} />
      <div className="layout__main">
        <main className="profile-page">

          {/* Hero */}
          <div className="profile-hero">
            <div className="profile-hero__inner">
              <div className="profile-hero__avatar-wrap">
                <div className="profile-hero__avatar">TC</div>
                <button className="profile-hero__edit-photo" title="Change photo">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </button>
              </div>
              <div className="profile-hero__info">
                <h1 className="profile-hero__name">Tenzin Choda</h1>
                <div className="profile-hero__meta">
                  <span className="profile-hero__meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Tenzee@gmail.com
                  </span>
                  <span className="profile-hero__meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012.86 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                    </svg>
                    +975 17886654
                  </span>
                </div>
                <div className="profile-hero__badges">
                  <span className="hero-badge hero-badge--verified">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    verified customer
                  </span>
                  <span className="hero-badge hero-badge--policies">3 Active Policies</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-body">
            {/* Stats */}
            <div className="profile-stats">
              {[
                { label: 'Total Coverage', value: 'Nu. 85,00,000', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
                { label: 'Annual Premium', value: 'Nu. 45,00,000/ year', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
                { label: 'Member Since', value: 'Jan 2024', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
              ].map(s => (
                <div key={s.label} className="profile-stat-card">
                  <div className="profile-stat-card__icon">{s.icon}</div>
                  <div>
                    <p className="profile-stat-card__label">{s.label}</p>
                    <p className="profile-stat-card__value">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="profile-tabs">
              {['personal', 'policies', 'security'].map(t => (
                <button
                  key={t}
                  className={`profile-tab ${tab === t ? 'profile-tab--active' : ''}`}
                  onClick={() => setTab(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="profile-tab-content">
              {tab === 'personal' && <PersonalTab />}
              {tab === 'policies' && <PoliciesTab />}
              {tab === 'security' && <SecurityTab />}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}