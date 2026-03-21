/* eslint-disable unused-imports/no-unused-vars */
import env from "@config/env";
import jwt from "jsonwebtoken";
import { JWT } from "@/lib/constants";

export interface jwtPayload {
  userId: string;
  purpose: string;
}

/**
 * Generate an access token
 *
 * Access tokens are short-lived (15 minutes)
 * Include user info needed for authorization
 *
 * @param userId - User's ID
 * @returns Signed JWT token
 */
export function generateToken(userId: string): string {
  const payload: jwtPayload = {
    userId,
    purpose: "auth",
  };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: JWT.EXPIRY,
    issuer: "chainsure",
    audience: "chainsure-api",
  });
}

/**
 * Verify and decode jwt token
 *
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): jwtPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: "chainsure",
      audience: "chainsure-api",
    }) as jwtPayload;

    return decoded;
  }
  catch (err) {
    // Token expired, invalid signature, or malformed
    return null;
  }
}
