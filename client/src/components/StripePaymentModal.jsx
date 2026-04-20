import { useEffect, useRef, useState } from 'react'
import { initiatePayment } from '../lib/api'
import { updateTrackedPolicyStatusByPolicyId } from '../lib/proposal-store'
import { getStripe } from '../lib/stripe-utils'
import './StripePaymentModal.css'

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const PAYMENT_APPEARANCE = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#5b67f1',
    colorText: '#0f172a',
    colorTextSecondary: '#475569',
    colorDanger: '#dc2626',
    colorBackground: '#ffffff',
    fontFamily: 'system-ui, sans-serif',
    borderRadius: '12px',
  },
}

function normalizePolicyId(value) {
  return String(value || '').trim()
}

function buildReturnUrl(policyId) {
  const url = new URL(window.location.href)
  url.searchParams.set('payment', 'return')
  if (policyId) {
    url.searchParams.set('policyId', policyId)
  }
  return url.toString()
}

function mapPaymentIntentStatusToPolicyStatus(status) {
  if (status === 'succeeded' || status === 'requires_capture') {
    return 'payment_confirmed'
  }

  if (status === 'processing') {
    return 'payment_processing'
  }

  if (status === 'requires_payment_method') {
    return 'payment_failed'
  }

  return ''
}

function getPaymentErrorMessage(error, paymentPolicyId) {
  if (error?.status === 401) {
    return 'Your session has expired. Sign in again and retry payment.'
  }

  if (error?.status === 404 && error?.message?.includes('/api/payments/initiate/')) {
    return 'The current backend is not exposing `/api/payments/initiate/:policyId`, so payment cannot start from this build until that server route is mounted.'
  }

  if (error?.status === 404 && /policy not found/i.test(error?.message || '')) {
    return `No payable policy was found for "${paymentPolicyId}". Use the issued policy ID, not the proposal ID, and make sure you are signed in to the account that owns the policy.`
  }

  return error?.message || 'Failed to initiate payment. Please try again.'
}

function teardownPaymentElement(paymentElementRef, elementsRef) {
  if (paymentElementRef.current) {
    try {
      paymentElementRef.current.unmount()
    } catch {
      // Stripe may already have detached the element after a redirect.
    }

    if (typeof paymentElementRef.current.destroy === 'function') {
      try {
        paymentElementRef.current.destroy()
      } catch {
        // Some Stripe.js builds do not expose destroy on the payment element.
      }
    }
  }

  paymentElementRef.current = null
  elementsRef.current = null
}

export default function StripePaymentModal({ proposal, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const [policyId, setPolicyId] = useState(() => normalizePolicyId(proposal?.policyId))
  const [paymentSession, setPaymentSession] = useState(null)
  const [paymentElementReady, setPaymentElementReady] = useState(false)
  const stripeRef = useRef(null)
  const elementsRef = useRef(null)
  const paymentElementRef = useRef(null)
  const paymentElementMountRef = useRef(null)

  useEffect(() => {
    let active = true

    getStripe()
      .then((stripe) => {
        if (!active) {
          return
        }

        if (!stripe) {
          setError('Stripe configuration not found. Set VITE_STRIPE_PUBLISHABLE_KEY in client/.env.')
          return
        }

        stripeRef.current = stripe
      })
      .catch(() => {
        if (active) {
          setError('Stripe failed to load. Check the publishable key configuration.')
        }
      })

    return () => {
      active = false
      teardownPaymentElement(paymentElementRef, elementsRef)
    }
  }, [])

  useEffect(() => {
    setPolicyId(normalizePolicyId(proposal?.policyId))
    setPaymentSession(null)
    setPaymentElementReady(false)
    setError('')
    teardownPaymentElement(paymentElementRef, elementsRef)
  }, [proposal?.key, proposal?.policyId])

  useEffect(() => {
    if (!paymentSession?.clientSecret || !paymentElementMountRef.current || !stripeRef.current) {
      return undefined
    }

    let active = true

    teardownPaymentElement(paymentElementRef, elementsRef)
    setPaymentElementReady(false)

    try {
      const elements = stripeRef.current.elements({
        clientSecret: paymentSession.clientSecret,
        appearance: PAYMENT_APPEARANCE,
      })

      const paymentElement = elements.create('payment', {
        layout: 'tabs',
      })

      paymentElement.on('ready', () => {
        if (active) {
          setPaymentElementReady(true)
        }
      })

      paymentElement.on('change', (event) => {
        if (!active) {
          return
        }

        if (event.error?.message) {
          setError(event.error.message)
          return
        }

        setError('')
      })

      paymentElement.mount(paymentElementMountRef.current)

      elementsRef.current = elements
      paymentElementRef.current = paymentElement
    } catch (mountError) {
      setError(mountError?.message || 'Failed to render the Stripe payment form.')
    }

    return () => {
      active = false
      teardownPaymentElement(paymentElementRef, elementsRef)
    }
  }, [paymentSession?.clientSecret])

  const handlePreparePayment = async () => {
    const paymentPolicyId = normalizePolicyId(policyId)

    if (!paymentPolicyId) {
      setError('Policy ID is required to proceed with payment.')
      return
    }

    if (!stripeRef.current) {
      setError('Stripe has not finished loading yet. Please wait a moment and try again.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setPaymentSession(null)
      setPaymentElementReady(false)
      teardownPaymentElement(paymentElementRef, elementsRef)

      const response = await initiatePayment(paymentPolicyId)

      if (!response?.data?.clientSecret) {
        throw new Error('The server did not return a Stripe client secret.')
      }

      setPaymentSession({
        clientSecret: response.data.clientSecret,
        type: response.data.type || 'payment_intent',
      })
    } catch (err) {
      setError(getPaymentErrorMessage(err, paymentPolicyId))
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    if (!stripeRef.current || !elementsRef.current) {
      setError('The Stripe payment form is not ready yet.')
      return
    }

    try {
      setConfirming(true)
      setError('')

      const result = await stripeRef.current.confirmPayment({
        elements: elementsRef.current,
        confirmParams: {
          return_url: buildReturnUrl(normalizePolicyId(policyId)),
        },
        redirect: 'if_required',
      })

      if (result.error) {
        throw new Error(result.error.message || 'Failed to confirm payment.')
      }

      let paymentIntent = result.paymentIntent || null

      if (!paymentIntent && paymentSession?.clientSecret) {
        const retrieved = await stripeRef.current.retrievePaymentIntent(paymentSession.clientSecret)

        if (retrieved.error) {
          throw new Error(retrieved.error.message || 'Failed to verify the Stripe payment status.')
        }

        paymentIntent = retrieved.paymentIntent || null
      }

      const status = paymentIntent?.status
      const nextPolicyStatus = mapPaymentIntentStatusToPolicyStatus(status)

      if (status === 'succeeded' || status === 'processing' || status === 'requires_capture') {
        if (nextPolicyStatus) {
          updateTrackedPolicyStatusByPolicyId({
            policyId: normalizePolicyId(policyId),
            policyStatus: nextPolicyStatus,
          })
        }

        onSuccess?.({
          policyId: normalizePolicyId(policyId),
          paymentStatus: status,
          policyStatus: nextPolicyStatus,
        })
        onClose?.()
        return
      }

      if (status) {
        setError(`Payment status: ${status}. Complete any required wallet or bank step, then try again if needed.`)
        return
      }

      setError('Stripe did not return a final payment status yet. Check the proposals page again in a moment.')
    } catch (err) {
      setError(err?.message || 'Failed to confirm payment.')
    } finally {
      setConfirming(false)
    }
  }

  const handleResetPaymentForm = () => {
    setPaymentSession(null)
    setPaymentElementReady(false)
    setError('')
    teardownPaymentElement(paymentElementRef, elementsRef)
  }

  return (
    <div className="payment-modal-overlay" onClick={(event) => {
      if (event.target === event.currentTarget) {
        onClose()
      }
    }}>
      <div className="payment-modal">
        <button className="payment-modal__close" onClick={onClose} aria-label="Close payment modal">
          <CloseIcon />
        </button>

        <div className="payment-modal__container">
          <div className="payment-modal__left">
            <h2 className="payment-modal__title">Order Summary</h2>
            <div className="payment-modal__summary">
              <p className="payment-modal__item-name">{proposal.name}</p>
              <p className="payment-modal__item-category">{proposal.category}</p>
              <p className="payment-modal__item-status">Status: {proposal.status}</p>
            </div>
            <p className="payment-modal__info">
              <LockIcon /> Secure payment powered by Stripe
            </p>
          </div>

          <div className="payment-modal__right">
            {error && (
              <div className="payment-modal__error">
                <p>{error}</p>
              </div>
            )}

            <div className="payment-modal__field-group">
              <label htmlFor="policyId" className="payment-modal__label">
                Policy ID
              </label>
              <input
                id="policyId"
                type="text"
                value={policyId}
                onChange={(event) => {
                  setPolicyId(event.target.value)
                  setError('')
                }}
                placeholder="Enter the issued policy ID"
                className="payment-modal__input"
                disabled={loading || confirming || Boolean(paymentSession)}
              />
              <p className="payment-modal__info-text">
                {proposal?.policyId
                  ? 'This policy ID was recovered from local browser tracking. You can replace it before preparing the payment form.'
                  : 'Use the issued policy ID from the approved policy record or email. Proposal IDs will return a not-found error here.'}
              </p>
            </div>

            {!paymentSession && (
              <button
                className="payment-modal__pay-button"
                onClick={handlePreparePayment}
                disabled={loading || confirming || !policyId.trim()}
              >
                {loading ? (
                  <>
                    <div className="payment-modal__spinner" />
                  </>
                ) : (
                  <>
                    <LockIcon /> Prepare Payment Form
                  </>
                )}
              </button>
            )}

            {paymentSession && (
              <>
                <div className="payment-modal__stripe-shell">
                  <div className="payment-modal__stripe-header">
                    <span className="payment-modal__stripe-title">Stripe Payment Form</span>
                    <span className="payment-modal__stripe-badge">
                      {paymentSession.type === 'subscription' ? 'Subscription start' : 'One-time payment'}
                    </span>
                  </div>
                  <div ref={paymentElementMountRef} className="payment-modal__stripe-element" />
                </div>

                <button
                  className="payment-modal__pay-button"
                  onClick={handleConfirmPayment}
                  disabled={loading || confirming || !paymentElementReady}
                >
                  {confirming ? (
                    <>
                      <div className="payment-modal__spinner" />
                    </>
                  ) : (
                    <>
                      <LockIcon /> Complete Payment
                    </>
                  )}
                </button>

                <button
                  className="payment-modal__secondary-button"
                  onClick={handleResetPaymentForm}
                  disabled={loading || confirming}
                >
                  Use Different Policy ID
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
