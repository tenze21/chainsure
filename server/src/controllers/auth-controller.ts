import type { Request, Response } from "express";
import env from "@/config/env";
import { EmailSchema, LoginSchema, RegisterSchema } from "@/lib/schemas";
import asyncHandler from "@/middlewares/async-handler";
import { getSaltByEmail, loginAdminUser, loginUser, registerAdminUser, registerUser } from "@/services/auth-service";

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
 * @desc Get stored login salt by email
 * @route GET /api/auth/salt
 * @access Public
 */
export const getSalt = asyncHandler(async (req: Request, res: Response) => {
  const email = EmailSchema.parse(req.query.email);
  const salt = await getSaltByEmail(email);

  res.status(200).json({
    success: true,
    data: { salt },
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

// ADMIN CONTROLLERS: ONLY FOR DEVELOPMENT
export const registerAdmin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const validatedData = RegisterSchema.parse(req.body);

  const authRespose = await registerAdminUser(validatedData);

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

export const loginAdmin = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = LoginSchema.parse(req.body);

  const authResponse = await loginAdminUser(validatedData);

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
