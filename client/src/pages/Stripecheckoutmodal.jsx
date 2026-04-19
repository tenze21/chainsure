import { useEffect, useRef, useState } from 'react'
import { initiatePolicyPayment } from '../lib/api'
import { formatCurrency, titleCase } from '../lib/formatters'
import { getStripeClient } from '../lib/stripe'
import './Stripecheckoutmodal.css'

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

export default function StripeCheckoutModal({ policy, user, onClose, onSuccess }) {
  const mountRef = useRef(null)
  const stripeRef = useRef(null)
  const elementsRef = useRef(null)
  const paymentElementRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const [paymentType, setPaymentType] = useState('')

  useEffect(() => {
    let active = true

    async function prepareCheckout() {
      if (!policy?.policyId) {
        setError('This approved proposal does not have a payable policy record in the browser yet.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const [stripe, paymentSession] = await Promise.all([
          getStripeClient(),
          initiatePolicyPayment(policy.policyId),
        ])

        if (!active || !mountRef.current) {
          return
        }

        stripeRef.current = stripe
        setPaymentType(paymentSession?.type || '')

        const elements = stripe.elements({
          clientSecret: paymentSession?.clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#0f1729',
            },
          },
        })

        const paymentElement = elements.create('payment', {
          layout: 'tabs',
          defaultValues: {
            billingDetails: {
              email: user?.email || '',
              name: user?.fullName || '',
            },
          },
        })

        paymentElement.mount(mountRef.current)
        elementsRef.current = elements
        paymentElementRef.current = paymentElement
      } catch (checkoutError) {
        if (active) {
          setError(checkoutError?.message || 'Could not initialize Stripe checkout.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    prepareCheckout()

    return () => {
      active = false
      paymentElementRef.current?.destroy?.()
      paymentElementRef.current = null
      elementsRef.current = null
    }
  }, [policy?.policyId, user?.email, user?.fullName])

  const handlePay = async () => {
    if (!stripeRef.current || !elementsRef.current) {
      return
    }

    setConfirming(true)
    setError('')

    try {
      const { error: stripeError } = await stripeRef.current.confirmPayment({
        elements: elementsRef.current,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/proposals`,
        },
        redirect: 'if_required',
      })

      if (stripeError) {
        setError(stripeError.message || 'Payment confirmation failed.')
        return
      }

      onSuccess?.()
      onClose?.()
    } catch (confirmError) {
      setError(confirmError?.message || 'Payment confirmation failed.')
    } finally {
      setConfirming(false)
    }
  }

  const displayAmount = formatCurrency(policy?.premium)
  const policyName = policy?.name || 'Approved policy'
  const paymentTypeLabel = paymentType ? titleCase(paymentType.replace(/_/g, ' ')) : 'Stripe payment'

  return (
    <div className="stripe-overlay" onClick={onClose}>
      <div className="stripe-modal" onClick={(event) => event.stopPropagation()}>
        <button className="stripe-modal__close" onClick={onClose}>
          <CloseIcon />
        </button>

        <div className="stripe-modal__left">
          <p className="stripe-modal__merchant">Pay ChainSure Private Limited</p>
          <p className="stripe-modal__total">{displayAmount}</p>

          <div className="stripe-modal__line-items">
            <div className="stripe-modal__line-item">
              <div>
                <p className="stripe-modal__item-name">{policyName}</p>
                <p className="stripe-modal__item-qty">{paymentTypeLabel}</p>
              </div>
              <div className="stripe-modal__item-price">
                <p>{displayAmount}</p>
                <p className="stripe-modal__item-each">Policy premium</p>
              </div>
            </div>
          </div>

          <div className="stripe-modal__footer">
            <span className="stripe-modal__powered">Powered by <strong>Stripe</strong></span>
          </div>
        </div>

        <div className="stripe-modal__right">
          <div className="stripe-modal__field-group">
            <label className="stripe-modal__label">Customer</label>
            <div className="stripe-modal__input">
              {user?.email || 'Signed-in customer'}
            </div>
          </div>

          <div className="stripe-modal__field-group">
            <label className="stripe-modal__label">Payment details</label>
            {loading && (
              <div className="stripe-modal__input">Preparing secure payment form...</div>
            )}
            {!loading && error && (
              <div className="stripe-modal__input" style={{ color: '#b91c1c' }}>{error}</div>
            )}
            <div
              ref={mountRef}
              className="stripe-modal__payment-element"
              style={{ display: loading || error ? 'none' : 'block' }}
            />
          </div>

          <button
            className={`stripe-modal__pay-btn ${confirming ? 'stripe-modal__pay-btn--loading' : ''}`}
            onClick={handlePay}
            disabled={loading || confirming || Boolean(error)}
          >
            {confirming ? (
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
