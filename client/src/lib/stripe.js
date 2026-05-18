const STRIPE_JS_URL = 'https://js.stripe.com/v3'

let stripeLoaderPromise = null

function loadStripeScript() {
  if (window.Stripe) {
    return Promise.resolve(window.Stripe)
  }

  if (stripeLoaderPromise) {
    return stripeLoaderPromise
  }

  stripeLoaderPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${STRIPE_JS_URL}"]`)

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.Stripe), { once: true })
      existingScript.addEventListener('error', () => reject(new Error('Could not load Stripe.js.')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = STRIPE_JS_URL
    script.async = true
    script.onload = () => resolve(window.Stripe)
    script.onerror = () => reject(new Error('Could not load Stripe.js.'))
    document.head.appendChild(script)
  })

  return stripeLoaderPromise
}

export async function getStripeClient() {
  const publishableKey = (
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
  ).trim();

  if (!publishableKey) {
    throw new Error(
      'Stripe publishable key is not configured. ' +
      'Add VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... to client/.env'
    );
  }

  if (!/^pk_(test|live)_/.test(publishableKey)) {
    throw new Error(
      'Invalid Stripe publishable key format. Must start with pk_test_ or pk_live_'
    );
  }

  const StripeConstructor = await loadStripeScript();
  if (typeof StripeConstructor !== 'function') {
    throw new Error('Stripe.js failed to load');
  }

  const stripe = StripeConstructor(publishableKey);
  if (!stripe) {
    throw new Error('Failed to initialize Stripe');
  }

  return stripe;

  if (!stripe) {
    throw new Error('Stripe could not be initialized with the current publishable key.')
  }

  return stripe
}
