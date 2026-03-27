import type Stripe from "stripe";
import env from "@/config/env";
import stripe from "@/config/stripe";
import { Payment, Policy, Subscription } from "@/database/models/index";
import { ERROR_CODES } from "@/lib/constants";
import { AppError } from "@/middlewares/error-handler";

type StripeInvoiceExpanded = Stripe.Invoice & {
  subscription: string | null;
  amount_paid: number;
};

type StripeSubscriptionItemExpanded = Stripe.SubscriptionItem & {
  current_period_end: number;
  current_period_start: number;
};

/**
 * @dev Verify and parse an incoming Stripe webhook.
 *
 * @note Why verify? Anyone on the internet could POST to your webhook URL.
 * Stripe signs every webhook with your STRIPE_WEBHOOK_SECRET.
 * constructEvent() verifies that signature — if it fails, the
 * request didn't come from Stripe and we reject it.
 *
 * rawBody must be the raw Buffer, NOT parsed JSON.
 * Express's json() middleware destroys the raw body, which is
 * why the webhook route needs special treatment (shown in controller).
 */
// eslint-disable-next-line node/prefer-global/buffer
export function constructStripeEvent(rawBody: Buffer, signature: string): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  }
  catch {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Invalid webhook signature", 400);
  }
}

/**
 * @dev Route the event to the appropriate handler.
 * We only care about two events:
 * - payment_intent.succeeded: a fixed one-time payment completed
 * - invoice.paid: a recurring subscription payment completed
 */
export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
    case "invoice.paid":
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case "payment_intent.payment_failed":
      await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    default:
      break;
  }
}

/**
 * @dev Fixed payment succeeded.
 *
 * @note Important: we check if a Payment record already exists before creating one.
 * This is called "idempotency" — making an operation safe to run multiple times.
 * Stripe retries webhooks if your server doesn't respond with 200,
 * so this handler might be called twice for the same event.
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const { policyId, userId, paymentType } = paymentIntent.metadata;

  // Only handle fixed payments here — recurring ones come through invoice.paid
  if (paymentType !== "fixed")
    return;

  if (!policyId || !userId) {
    console.error("Missing metadata in PaymentIntent:", paymentIntent.id);
    throw new AppError(ERROR_CODES.PAYMENT_ERROR, "There has been an error while processing payment", 500);
  }

  // Idempotency check — don't create duplicate Payment records
  const existingPayment = await Payment.findOne({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (existingPayment)
    return;

  const policy = await Policy.findByPk(policyId);
  if (!policy) {
    console.error("Policy not found for PaymentIntent:", paymentIntent.id);
    throw new AppError(ERROR_CODES.PAYMENT_ERROR, "There has been an error while processing payment", 500);
  }

  await Payment.create({
    userId,
    policyId,
    stripePaymentIntentId: paymentIntent.id,
    stripeInvoiceId: null,
    amount: paymentIntent.amount / 100,
    status: "succeeded",
  });

  await policy.update({ status: "payment_confirmed" });
}

/**
 * @dev Recurring subscription invoice paid.
 * This fires for BOTH the first payment and all renewals.
 *
 * @note For the first payment: create Subscription record + Payment record
 * For renewals: just create a new Payment record, update billing dates
 */
async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const stripeInvoice = invoice as StripeInvoiceExpanded;

  if (!stripeInvoice.subscription)
    return;

  const stripeSubscriptionId = stripeInvoice.subscription;

  const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const { policyId, userId } = stripeSubscription.metadata;

  if (!policyId || !userId) {
    console.error("Missing metadata in Subscription:", stripeSubscriptionId);
    throw new AppError(ERROR_CODES.PAYMENT_ERROR, "There has been an error while processing payment", 500);
  }

  if (!stripeSubscription.items?.data?.length) {
    console.error("No subscription items found:", stripeSubscriptionId);
    throw new AppError(ERROR_CODES.PAYMENT_ERROR, "There has been an error while processing payment", 500);
  }

  // Cast the item to access current_period_end which moved here in newer API versions
  const firstItem = stripeSubscription.items.data[0] as StripeSubscriptionItemExpanded;

  if (!firstItem?.price?.id) {
    console.error("No price ID found in subscription item:", stripeSubscriptionId);
    throw new AppError(ERROR_CODES.PAYMENT_ERROR, "There has been an error while processing payment", 500);
  }

  const stripePriceId = firstItem.price.id;
  const currentPeriodEnd = firstItem.current_period_end;

  const existingPayment = await Payment.findOne({
    where: { stripeInvoiceId: invoice.id },
  });
  if (existingPayment)
    return;

  let subscription = await Subscription.findOne({ where: { stripeSubscriptionId } });

  if (!subscription) {
    subscription = await Subscription.create({
      userId,
      policyId,
      stripeSubscriptionId,
      stripePriceId,
      status: "active",
      nextBillingDate: new Date(currentPeriodEnd * 1000),
      currentPeriodEnd: new Date(currentPeriodEnd * 1000),
    });

    await Policy.update(
      { status: "payment_confirmed" },
      { where: { id: policyId } },
    );
  }
  else {
    await subscription.update({
      status: "active",
      nextBillingDate: new Date(currentPeriodEnd * 1000),
      currentPeriodEnd: new Date(currentPeriodEnd * 1000),
    });
  }

  await Payment.create({
    userId,
    policyId,
    subscriptionId: subscription.id,
    stripeInvoiceId: invoice.id,
    stripePaymentIntentId: null,
    amount: stripeInvoice.amount_paid / 100,
    status: "succeeded",
  });
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const { policyId } = paymentIntent.metadata;
  if (!policyId)
    return;

  await Payment.create({
    userId: paymentIntent.metadata.userId,
    policyId,
    stripePaymentIntentId: paymentIntent.id,
    stripeInvoiceId: null,
    amount: paymentIntent.amount / 100,
    status: "failed",
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const stripeInvoice = invoice as StripeInvoiceExpanded;
  if (!stripeInvoice.subscription)
    return;

  const stripeSubscriptionId = stripeInvoice.subscription as string;
  const subscription = await Subscription.findOne({ where: { stripeSubscriptionId } });

  if (subscription) {
    await subscription.update({ status: "past_due" });
  }
}
