import type { Request, Response } from "express";
import { Policy, Subscription, User } from "@/database/models";
import asyncHandler from "@/middlewares/async-handler";

/**
 * @desc Get Subscriptions
 * @route POST /api/subscriptions
 * @access Private(Admin)
 */
export const getSubscriptions = asyncHandler(async (_req: Request, res: Response) => {
  const subscriptions = await Subscription.findAll({
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: Policy,
        as: "policy",
      },
      {
        model: User,
        as: "user",
        attributes: { exclude: ["passwordHash"] },
      },
    ],
  });
  res.status(200).json({
    success: true,
    data: { subscriptions },
  });
});
