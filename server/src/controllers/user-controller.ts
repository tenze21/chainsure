import type { Request, Response } from "express";
import { User } from "@database/models";
import { updateProfileSchema } from "@lib/schemas";
import asyncHandler from "@middlewares/async-handler";
import { ERROR_CODES } from "@/lib/constants";
import { AppError } from "@/middlewares/error-handler";

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
