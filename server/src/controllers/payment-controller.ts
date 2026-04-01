/* eslint-disable jsdoc/check-access */
import type { Request, Response } from "express";
import { constructStripeEvent, handleStripeWebhook } from "@services/webhook-service";
import { Policy, User } from "@/database/models/index";
import { ERROR_CODES } from "@/lib/constants";
import asyncHandler from "@/middlewares/async-handler";
import { AppError } from "@/middlewares/error-handler";
import { initiatePayment } from "@/services/payment-service";

/**
 * @desc  Initiate payment for an approved policy
 * @route POST /api/payments/initiate/:policyId
 * @access Private
 */
export const initiate = asyncHandler(async (req: Request, res: Response) => {
  const { policyId } = req.params;
  const userId = req.user.id;

  const policy = await Policy.findOne({ where: { id: policyId, userId } });
  if (!policy) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "Policy not found", 404);
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "User not found", 404);
  }

  const result = await initiatePayment(user, policy);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * @desc  Handle Stripe webhook events
 * @route POST /api/webhooks/stripe
 * @access Public (but verified via Stripe signature)
 *
 * CRITICAL: This route must receive the raw request body as a Buffer.
 * In your router, register this route BEFORE express.json() middleware,
 * or use express.raw({ type: "application/json" }) specifically for this route.
 */
export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];

  if (!signature || typeof signature !== "string") {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Missing Stripe signature", 400);
  }

  // req.body here must be the raw Buffer — see routing note above
  // eslint-disable-next-line node/prefer-global/buffer
  const event = constructStripeEvent(req.body as Buffer, signature);

  await handleStripeWebhook(event);

  // Always respond 200 quickly — Stripe will retry if you don't
  res.status(200).json({ received: true });
});
