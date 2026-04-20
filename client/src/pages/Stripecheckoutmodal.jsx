import { useState } from 'react'
import './StripeCheckoutModal.css'

// ─── Icons ────────────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const GPay = () => (
  <svg width="44" height="18" viewBox="0 0 44 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="14" fontFamily="'Product Sans', Arial, sans-serif" fontWeight="500" fontSize="14" fill="white">G</text>
    <text x="12" y="14" fontFamily="'Product Sans', Arial, sans-serif" fontWeight="400" fontSize="14" fill="white">Pay</text>
  </svg>
)

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

// ─── Stripe Checkout Modal ────────────────────────────────────────────────────

export default function StripeCheckoutModal({ app, onClose, onSuccess }) {
  const [email, setEmail]       = useState('')
  const [cardNum, setCardNum]   = useState('')
  const [expiry, setExpiry]     = useState('')
  const [cvc, setCvc]           = useState('')
  const [name, setName]         = useState('')
  const [country, setCountry]   = useState('')
  const [loading, setLoading]   = useState(false)

  // Format card number with spaces every 4 digits
  const handleCardNum = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16)
    setCardNum(raw.replace(/(.{4})/g, '$1 ').trim())
  }

  // Format expiry as MM/YY
  const handleExpiry = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4)
    setExpiry(raw.length > 2 ? raw.slice(0, 2) + '/' + raw.slice(2) : raw)
  }

  const handlePay = () => {
    if (!email || !cardNum || !expiry || !cvc || !name || !country) {
      alert('Please fill in all fields.')
      return
    }
    setLoading(true)
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false)
      onSuccess && onSuccess()
    }, 1800)
  }

  // Derive display values from the app prop
  const policyName    = app?.type       || 'Motor Insurance'
  const premiumRaw    = app?.approvedPremium || 'Nu.450'
  const amount        = premiumRaw.replace('Nu.', '').replace(',', '').trim()
  const displayAmount = `Nu. ${amount}`

  return (
    <div className="stripe-overlay" onClick={onClose}>
      <div className="stripe-modal" onClick={(e) => e.stopPropagation()}>

        {/* Close */}
        <button className="stripe-modal__close" onClick={onClose}>
          <CloseIcon />
        </button>

        {/* ── Left: Order summary ── */}
        <div className="stripe-modal__left">
          <p className="stripe-modal__merchant">Pay ChainSure Private Limited</p>
          <p className="stripe-modal__total">{displayAmount}</p>

          <div className="stripe-modal__line-items">
            <div className="stripe-modal__line-item">
              <div>
                <p className="stripe-modal__item-name">{policyName}</p>
                <p className="stripe-modal__item-qty">Qty 1</p>
              </div>
              <div className="stripe-modal__item-price">
                <p>{displayAmount}</p>
                <p className="stripe-modal__item-each">{displayAmount} each</p>
              </div>
            </div>
          </div>

          <div className="stripe-modal__footer">
            <span className="stripe-modal__powered">Powered by <strong>Stripe</strong></span>
            <a href="#" className="stripe-modal__link">Terms</a>
            <a href="#" className="stripe-modal__link">Policy</a>
          </div>
        </div>

        {/* ── Right: Payment form ── */}
        <div className="stripe-modal__right">

          {/* Google Pay */}
          <button className="stripe-modal__gpay">
            <GPay />
            <span>Pay</span>
          </button>

          <div className="stripe-modal__divider">
            <span>Or pay with card</span>
          </div>

          {/* Email */}
          <div className="stripe-modal__field-group">
            <label className="stripe-modal__label">Email</label>
            <input
              className="stripe-modal__input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Card information */}
          <div className="stripe-modal__field-group">
            <label className="stripe-modal__label">Card information</label>
            <div className="stripe-modal__card-fields">
              <input
                className="stripe-modal__input stripe-modal__input--card-num"
                type="text"
                placeholder="1234 1234 1234 1234"
                value={cardNum}
                onChange={handleCardNum}
                maxLength={19}
              />
              <div className="stripe-modal__card-row">
                <input
                  className="stripe-modal__input stripe-modal__input--expiry"
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={handleExpiry}
                  maxLength={5}
                />
                <input
                  className="stripe-modal__input stripe-modal__input--cvc"
                  type="text"
                  placeholder="CVC"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          {/* Name on card */}
          <div className="stripe-modal__field-group">
            <label className="stripe-modal__label">Name on card</label>
            <input
              className="stripe-modal__input"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Country */}
          <div className="stripe-modal__field-group">
            <label className="stripe-modal__label">Country or region</label>
            <input
              className="stripe-modal__input"
              type="text"
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          {/* Pay button */}
          <button
            className={`stripe-modal__pay-btn ${loading ? 'stripe-modal__pay-btn--loading' : ''}`}
            onClick={handlePay}
            disabled={loading}
          >
            {loading ? (
              <span className="stripe-modal__spinner" />
            ) : (
              <>
                <LockIcon />
                Pay {displayAmount}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}