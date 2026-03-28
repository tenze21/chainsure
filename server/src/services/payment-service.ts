import type { Policy, User } from "@database/models/index";
import type Stripe from "stripe";
import type { InitiatePaymentResponse } from "@/lib/types";
import stripe from "@config/stripe";
import { ERROR_CODES } from "@lib/constants";
import { AppError } from "@middlewares/error-handler";

/**
 * @dev Get or create a Stripe Customer for a user. This ensures one user always maps to one Stripe Customer.
 *
 * @note Stripe groups payment methods, invoices, and subscriptions
 * under a Customer. Creating duplicates causes billing chaos.
 */
async function getOrCreateStripeCustomer(user: User): Promise<string> {
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.fullName,
    metadata: {
      userId: user.id,
    },
  });

  await user.update({ stripeCustomerId: customer.id });

  return customer.id;
}

/**
 * @dev Initiate payment for an approved policy. Returns a client_secret that the frontend uses with Stripe.js to render the payment UI and confirm the payment.
 */
export async function initiatePayment(user: User, policy: Policy): Promise<InitiatePaymentResponse> {
  if (policy.status !== "pending" && policy.status !== "active") {
    throw new AppError(ERROR_CODES.INVALID_STATE, "This policy is not in payable state", 400);
  }

  const stripeCustomerId = await getOrCreateStripeCustomer(user);

  if (policy.paymentType === "fixed") {
    return initiateFixedPayment(stripeCustomerId, policy);
  }

  if (policy.paymentType === "recurring") {
    return initiateRecurringPayment(stripeCustomerId, policy);
  }

  throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Unknown payment type", 500);
}

/**
 * @dev Fixed payment: create a Stripe PaymentIntent.
 * premium is in your DB as a decimal (e.g. 500.00).
 * Stripe works in the smallest currency unit (cents/paisa),
 * so we multiply by 100.
 */
async function initiateFixedPayment(stripeCustomerId: string, policy: Policy): Promise<InitiatePaymentResponse> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(Number(policy.premium) * 100),
    currency: "usd",
    customer: stripeCustomerId,
    metadata: {
      policyId: policy.id,
      userId: policy.userId,
      paymentType: "fixed",
    },

    automatic_payment_methods: { enabled: true },
  });

  if (!paymentIntent.client_secret) {
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to create payment intent", 500);
  }

  return { clientSecret: paymentIntent.client_secret, type: "payment_intent" };
}

/**
 * @dev Recurring payment: create a Stripe Subscription.
 *
 * @note Stripe Subscriptions require a Price object (created in Stripe dashboard or via API) that defines the billing amount and cycle.
 * The subscription creation immediately generates an Invoice,
 * and that Invoice contains a PaymentIntent with a client_secret.
 * That's what the frontend uses to collect the first payment.
 */
async function initiateRecurringPayment(stripeCustomerId: string, policy: Policy): Promise<InitiatePaymentResponse> {
  if (!policy.stripePriceId) {
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Recurring policy is missing a Stripe Price ID", 500);
  }

  const subscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: policy.stripePriceId }],
    // payment_behavior: "default_incomplete" means Stripe creates
    // the subscription but waits for payment before activating it.
    // Without this, Stripe tries to charge immediately and may
    // activate even before the user completes the payment UI.
    payment_behavior: "default_incomplete",
    // expand: ["latest_invoice.payment_intent"] tells Stripe to
    // include the nested PaymentIntent in the response so we can
    // get the client_secret without a second API call.
    expand: ["latest_invoice.payment_intent"],
    metadata: {
      policyId: policy.id,
      userId: policy.userId,
    },
  }) as unknown as Stripe.Subscription & {
    latest_invoice: Stripe.Invoice & {
      payment_intent: Stripe.PaymentIntent;
    };
  };

  const invoice = subscription.latest_invoice;

  if (typeof invoice === "string" || !invoice) {
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to get invoice from subscription", 500);
  }

  const paymentIntent = invoice.payment_intent;

  if (typeof paymentIntent === "string" || !paymentIntent || !paymentIntent.client_secret) {
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to create subscription payment", 500);
  }

  return { clientSecret: paymentIntent.client_secret, type: "subscription" };
}
