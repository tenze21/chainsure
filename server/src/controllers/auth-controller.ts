import type { Request, Response } from "express";
import env from "@/config/env";
import { LoginSchema, RegisterSchema } from "@/lib/schemas";
import asyncHandler from "@/middlewares/async-handler";
import { loginUser, registerUser } from "@/services/auth-service";

/**
 * @desc Register user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const validatedData = RegisterSchema.parse(req.body);

  const authRespose = await registerUser(validatedData);

  res.cookie("jwt", authRespose.jwtToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
  });

  res.status(201).json({
    success: true,
    data: {
      user: authRespose.user,
      salt: authRespose.salt,
    },
  });
});

/**
 * @desc Authorize user and get token
 * @route POST /api/auth/login
 * @access Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = LoginSchema.parse(req.body);

  const authResponse = await loginUser(validatedData);

  res.cookie("jwt", authResponse.jwtToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
  });

  res.status(200).json({
    success: true,
    data: {
      user: authResponse.user,
      salt: authResponse.salt,
    },
  });
});

/**
 * @desc Logout user/clear cookie
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  // Clear refresh token cookie
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({
    success: true,
    data: { message: "Logged out successfully" },
  });
});
