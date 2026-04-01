import type { NextFunction, Request, Response } from "express";
import type { RequestUserData } from "@/lib/types";
import { Role, User } from "@database/models/index";
import { ERROR_CODES } from "@lib/constants";
import { verifyToken } from "@utils/jwt.js";
import asyncHandler from "./async-handler";
import { AppError } from "./error-handler";

/**
 * Authentication Middleware
 *
 * Protects routes by verifying JWT access token
 * Attaches user data to request object
 */

export const authenticate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;
  if (!token) {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "Auth token not found", 401);
  }

  const payload = verifyToken(token);
  if (!payload) {
    throw new AppError(ERROR_CODES.TOKEN_EXPIRED, "Invalid or expired auth token", 401);
  }

  const user = await User.findByPk(payload.userId);
  if (!user) {
    res.status(401).json({
      success: false,
      error: {
        code: ERROR_CODES.UNAUTHORIZED,
        message: "User not found",
      },
    });
    return;
  }

  if (user.status === "suspended") {
    throw new AppError(ERROR_CODES.FORBIDDEN, "Account suspended", 403);
  }

  const role = await Role.findByPk(user.roleId);
  if (!role) {
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "User role not found", 500);
  }

  // Attach user data to request
  const requestUserData: RequestUserData = {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    role: role.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  req.user = requestUserData;
  next();
});

export function admin(req: Request, _res: Response, next: NextFunction) {
  if (req.user && req.user.role === "admin") {
    next();
  }
  else {
    throw new AppError(ERROR_CODES.UNAUTHORIZED, "permission denied", 401);
  }
}
