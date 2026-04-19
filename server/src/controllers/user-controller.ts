import type { Request, Response } from "express";
import { Policy, Role, User, Wallet } from "@database/models";
import { updateProfileSchema } from "@lib/schemas";
import asyncHandler from "@middlewares/async-handler";
import { ERROR_CODES } from "@/lib/constants";
import { AppError } from "@/middlewares/error-handler";

const USER_STATUS_VALUES = ["active", "suspended"] as const;

/**
 * @desc Get policyholder users for admin management
 * @route GET /api/user/admin
 * @access Private(Admin)
 */
export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.findAll({
    attributes: { exclude: ["passwordHash", "salt", "stripeCustomerId"] },
    include: [
      {
        model: Role,
        as: "role",
        attributes: ["name"],
        required: true,
        where: { name: "user" },
      },
      {
        model: Wallet,
        as: "wallet",
        attributes: ["walletAddress"],
        required: false,
      },
      {
        model: Policy,
        as: "policies",
        attributes: ["id"],
        required: false,
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.status(200).json({
    success: true,
    data: {
      users: users.map(user => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        walletAddress: user.wallet?.walletAddress || null,
        policiesCount: user.policies?.length || 0,
        joinedAt: user.createdAt,
        status: user.status,
      })),
    },
  });
});

/**
 * @desc Update user profile
 * @route PATCH /api/user/
 * @access Private
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = updateProfileSchema.parse(req.body);

  const userId = req.user.id;
  const user = await User.findByPk(userId, { attributes: { exclude: ["passwordHash", "salt", "stripeCustomerId"] } });

  if (!user) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "User not found", 404);
  }

  await user.update(validatedData);

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
});

/**
 * @desc Update user account status
 * @route PATCH /api/user/:id/status
 * @access Private(Admin)
 */
export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.id as string;
  const status = req.body?.status as string | undefined;

  if (!status || !USER_STATUS_VALUES.includes(status as typeof USER_STATUS_VALUES[number])) {
    throw new AppError(ERROR_CODES.BAD_REQUEST, "Invalid user status", 400);
  }

  if (req.user.id === userId && status === "suspended") {
    throw new AppError(ERROR_CODES.BAD_REQUEST, "You cannot suspend your own account", 400);
  }

  const user = await User.findByPk(userId, {
    include: [{
      model: Role,
      as: "role",
      attributes: ["name"],
    }],
    attributes: { exclude: ["passwordHash", "salt", "stripeCustomerId"] },
  });

  if (!user) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "User not found", 404);
  }

  if (user.role?.name !== "user") {
    throw new AppError(ERROR_CODES.BAD_REQUEST, "Only policyholder accounts can be updated", 400);
  }

  await user.update({ status });

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        status: user.status,
      },
      message: "User status updated successfully",
    },
  });
});

/**
 * @desc Get user details
 * @route GET /api/user/
 * @access Private
 */
export const getUserDetails = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const user = await User.findByPk(userId, { attributes: { exclude: ["passwordHash", "salt", "stripeCustomerId"] } });
  if (!user) {
    throw new AppError(ERROR_CODES.NOT_FOUND, "User not found", 404);
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});
