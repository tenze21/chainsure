import { initiate, stripeWebhook } from "@controllers/payment-controller";
import { authenticate } from "@middlewares/auth-middleware";
import express from "express";

export const paymentWebhookRoutes = express.Router();
const router = express.Router();

// IMPORTANT: The webhook route uses express.raw() instead of express.json()
// because Stripe signature verification needs the raw request body bytes.
// If express.json() parses it first, the body becomes a JS object and
// the signature check will always fail.
paymentWebhookRoutes.post("/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhook);

// Regular protected route
router.post("/payments/initiate/:policyId", authenticate, initiate);

export default router;
