import { loadStripe } from '@stripe/stripe-js'

let stripePromise

export function getStripe() {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.trim()

  if (!publishableKey) {
    return Promise.resolve(null)
  }

  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey)
  }

  return stripePromise
}
