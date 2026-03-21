import env from "@config/env";
import rateLimit from "express-rate-limit";
import { ERROR_CODES } from "@/lib/constants";

/**
 * Rate Limiting Middleware
 *
 * Prevents abuse by limiting requests per IP
 */

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    error: {
      code: ERROR_CODES.FORBIDDEN,
      message: "Too many requests, please try again later",
    },
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Customize handler
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: ERROR_CODES.FORBIDDEN,
        message: "Too many requests, please try again later",
      },
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 *
 * Prevents brute force attacks on login/register
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10, // 10 request per window
  message: {
    success: false,
    error: {
      code: ERROR_CODES.FORBIDDEN,
      message: "Too many authentication attempts, please try again later",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests

  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: ERROR_CODES.FORBIDDEN,
        message: "Too many authentication attempts, please try again later",
      },
    });
  },
});
