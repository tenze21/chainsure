import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import './UserProfile.css'
import { formatDate, titleCase } from '../lib/formatters'
import { buildProfileFormState, buildProfileUpdatePayload, normalizeProfileFieldValue } from '../lib/profile'
import { getInitials } from '../lib/session'

function getSaveErrorMessage(error) {
  const validationDetails = error?.data?.error?.details

  if (Array.isArray(validationDetails) && validationDetails.length > 0) {
    return validationDetails[0]?.message || error.message
  }

  if (error?.message === 'Validation error') {
    return 'The server rejected one of the profile values. Recheck CID, contact number, gender, and marital status.'
  }

  return error?.message || 'Could not save your profile.'
}

function ProfileField({
  label,
  field,
  form,
  type = 'text',
  readOnly = false,
  onChange,
  children,
}) {
  return (
    <div className="pf-field">
      <label className="pf-field__label">{label}</label>
      {children || (
        <input
          className="pf-field__input"
          type={type}
          value={form[field]}
          readOnly={readOnly}
          onChange={(event) => onChange(field, event.target.value)}
        />
      )}
    </div>
  )
}

function PersonalTab({ user, onSaveProfile }) {
  const [form, setForm] = useState(() => buildProfileFormState(user))
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(buildProfileFormState(user))
    setDirty(false)
    setSaved(false)
    setError('')
  }, [user])

  const setField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }))
    setDirty(true)
    setSaved(false)
    setError('')
  }

  const handleReset = () => {
    setForm(buildProfileFormState(user))
    setDirty(false)
    setSaved(false)
    setError('')
  }

  const handleSave = async () => {
    const normalizedForm = buildProfileFormState(form)
    const initialForm = buildProfileFormState(user)

    if (normalizedForm.contactNumber && !/^(17|77)\d{6}$/.test(normalizedForm.contactNumber)) {
      setError('Contact number must be 8 digits and start with 17 or 77.')
      return
    }

    if (normalizedForm.cid && !/^[A-Za-z0-9]{11}$/.test(normalizedForm.cid)) {
      setError('CID must be exactly 11 alphanumeric characters.')
      return
    }

    if (form.gender && !normalizeProfileFieldValue('gender', form.gender)) {
      setError('Select a valid gender.')
      return
    }

    if (form.maritalStatus && !normalizeProfileFieldValue('maritalStatus', form.maritalStatus)) {
      setError('Select a valid marital status.')
      return
    }

    const payload = buildProfileUpdatePayload(normalizedForm, initialForm)

    if (!Object.keys(payload).length) {
      setError('There are no valid profile changes to save.')
      return
    }

    setSaving(true)

    try {
      await onSaveProfile(payload)
      setDirty(false)
      setSaved(true)
      setError('')
    } catch (saveError) {
      setError(getSaveErrorMessage(saveError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="pf-card">
      <div className="profile-inline-note">
        Only fields supported by `PATCH /api/user/update` are editable here. Email, wallet data, and emergency contacts are not exposed by the current profile API.
      </div>

      <div className="pf-card__section">
        <h3 className="pf-card__section-title">Profile Details</h3>
        <div className="pf-grid">
          <ProfileField label="Full Name" field="fullName" form={form} onChange={setField} />
          <ProfileField label="CID" field="cid" form={form} onChange={setField} />
          <ProfileField label="Email Address" field="email" form={form} onChange={setField} readOnly />
          <ProfileField label="Contact Number" field="contactNumber" form={form} onChange={setField} />
          <ProfileField label="Date of Birth" field="dob" form={form} onChange={setField} type="date" />
          <ProfileField label="Occupation" field="occupation" form={form} onChange={setField} />
          <ProfileField label="Gender" field="gender" form={form} onChange={setField}>
            <select className="pf-field__input" value={form.gender} onChange={(event) => setField('gender', event.target.value)}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </ProfileField>
          <ProfileField label="Marital Status" field="maritalStatus" form={form} onChange={setField}>
            <select className="pf-field__input" value={form.maritalStatus} onChange={(event) => setField('maritalStatus', event.target.value)}>
              <option value="">Select status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </ProfileField>
        </div>
        <div className="pf-field" style={{ marginTop: 14 }}>
          <label className="pf-field__label">Address</label>
          <textarea
            className="pf-field__input profile-textarea"
            value={form.address}
            onChange={(event) => setField('address', event.target.value)}
            rows={4}
          />
        </div>
      </div>

      {error && <div className="profile-inline-error">{error}</div>}

      <div className="pf-card__actions">
        {saved && <span className="save-success">Changes saved to the backend</span>}
        <button className="pf-btn pf-btn--outline" onClick={handleReset} disabled={!dirty || saving}>
          Reset
        </button>
        <button className="pf-btn pf-btn--primary" onClick={handleSave} disabled={!dirty || saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

function PoliciesTab({ proposals, onNavigate }) {
  return (
    <div className="pf-card">
      <h3 className="pf-card__section-title" style={{ marginBottom: 16 }}>Policy Read API Status</h3>
      <div className="profile-inline-note">
        This backend snapshot does not expose a user `GET /api/policy` endpoint. The closest live data available here is proposal status.
      </div>

      <div className="pf-policy-list">
        {proposals.length === 0 && (
          <div className="profile-empty-state">
            No live proposal activity is available for this session yet.
          </div>
        )}

        {proposals.map((proposal) => (
          <div key={proposal.key} className="pf-policy-row">
            <div className="pf-policy-row__left">
              <div className="pf-policy-row__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <p className="pf-policy-row__name">{proposal.name}</p>
                <p className="pf-policy-row__coverage">{proposal.category}</p>
              </div>
            </div>
            <div className="pf-policy-row__mid">
              <p className="pf-policy-row__meta-label">Submitted</p>
              <p className="pf-policy-row__meta-val">{formatDate(proposal.createdAt)}</p>
            </div>
            <span className={`pf-badge pf-badge--${proposal.status}`}>
              <span className="pf-badge__dot" />
              {titleCase(proposal.status)}
            </span>
          </div>
        ))}
      </div>

      <div className="pf-card__actions">
        <button className="pf-btn pf-btn--outline" onClick={() => onNavigate('marketplace')}>
          Browse Marketplace
        </button>
        <button className="pf-btn pf-btn--primary" onClick={() => onNavigate('proposals')}>
          View Proposals
        </button>
      </div>
    </div>
  )
}

function SecurityTab({ user, onSignOut }) {
  return (
    <>
      <div className="pf-card" style={{ marginBottom: 20 }}>
        <h3 className="pf-card__section-title" style={{ marginBottom: 18 }}>Access & Security</h3>

        <div className="sec-row">
          <div>
            <p className="sec-row__title">Email Verification</p>
            <p className="sec-row__sub">Read from the stored auth response.</p>
          </div>
          <span className="sec-enabled-badge">{user?.emailVerified ? 'Verified' : 'Unverified'}</span>
        </div>
        <div className="sec-divider" />

        <div className="sec-row">
          <div>
            <p className="sec-row__title">Password Changes</p>
            <p className="sec-row__sub">No `change-password` route exists on this server branch.</p>
          </div>
          <button className="pf-btn pf-btn--outline pf-btn--sm" disabled>
            Unavailable
          </button>
        </div>
        <div className="sec-divider" />

        <div className="sec-row">
          <div>
            <p className="sec-row__title">Current Session</p>
            <p className="sec-row__sub">Signing out clears the stored user snapshot and requests `/api/auth/logout`.</p>
          </div>
          <button className="pf-btn pf-btn--outline pf-btn--sm" onClick={onSignOut}>
            Sign Out
          </button>
        </div>
      </div>

      <div className="pf-card">
        <h3 className="pf-card__section-title" style={{ marginBottom: 18 }}>Wallet Snapshot</h3>
        <div className="wallet-row">
          <span className="wallet-row__label">Wallet Address</span>
          <div className="wallet-row__val">
            <span className="wallet-address">{user?.walletAddress || 'Not available in this session'}</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default function UserProfile({
  onNavigate,
  onSignOut,
  user,
  currentPageLabel,
  proposals,
  products,
  onSaveProfile,
  missingProfileFields,
}) {
  const [tab, setTab] = useState('personal')
  const initials = getInitials(user?.fullName)
  const approvedCount = proposals.filter((proposal) => proposal.status === 'approved').length
  const connectedTemplates = products.filter((product) => product.templateStatus === 'ready').length

  return (
    <div className="layout">
      <Sidebar activePage="profile" onNavigate={onNavigate} onSignOut={onSignOut} />
      <div className="layout__main">
        <Topbar onNavigate={onNavigate} user={user} currentPageLabel={currentPageLabel} />
        <main className="profile-page">
          <div className="profile-hero">
            <div className="profile-hero__inner">
              <div className="profile-hero__avatar-wrap">
                <div className="profile-hero__avatar">{initials}</div>
              </div>
              <div className="profile-hero__info">
                <h1 className="profile-hero__name">{user?.fullName || 'Guest User'}</h1>
                <div className="profile-hero__meta">
                  <span className="profile-hero__meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {user?.email || 'Profile identity comes from the stored login response'}
                  </span>
                  <span className="profile-hero__meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012.86 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                    </svg>
                    {user?.contactNumber || 'No contact number saved yet'}
                  </span>
                </div>
                <div className="profile-hero__badges">
                  <span className="hero-badge hero-badge--verified">
                    {user?.emailVerified ? 'verified customer' : 'unverified email'}
                  </span>
                  <span className="hero-badge hero-badge--policies">{approvedCount} Approved Proposals</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-body">
            <div className="profile-stats">
              {[
                { label: 'Connected Templates', value: connectedTemplates, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
                { label: 'Approved Proposals', value: approvedCount, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg> },
                { label: 'Member Since', value: user?.createdAt ? formatDate(user.createdAt, { month: 'short', year: 'numeric' }) : 'Unavailable', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
              ].map((stat) => (
                <div key={stat.label} className="profile-stat-card">
                  <div className="profile-stat-card__icon">{stat.icon}</div>
                  <div>
                    <p className="profile-stat-card__label">{stat.label}</p>
                    <p className="profile-stat-card__value">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="profile-tabs">
              {['personal', 'policies', 'security'].map((tabName) => (
                <button
                  key={tabName}
                  className={`profile-tab ${tab === tabName ? 'profile-tab--active' : ''}`}
                  onClick={() => setTab(tabName)}
                >
                  {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
                </button>
              ))}
            </div>

            <div className="profile-tab-content">
              {missingProfileFields.length > 0 && (
                <div className="profile-inline-note" style={{ marginBottom: 16 }}>
                  Proposal submission is blocked until you add: {missingProfileFields.join(', ')}.
                </div>
              )}
              {tab === 'personal' && <PersonalTab user={user} onSaveProfile={onSaveProfile} />}
              {tab === 'policies' && <PoliciesTab proposals={proposals} onNavigate={onNavigate} />}
              {tab === 'security' && <SecurityTab user={user} onSignOut={onSignOut} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
