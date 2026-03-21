import type { NextFunction, Request, Response } from "express";
import type { ErrorCode } from "@/lib/constants";
import { ZodError } from "zod";
import env from "@/config/env";
import { ERROR_CODES } from "@/lib/constants";

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = "AppError";
  }
}

function notFound(req: Request, _res: Response, next: NextFunction) {
  const error = new AppError(ERROR_CODES.NOT_FOUND, `Not Found - ${req.originalUrl}`, 404);
  next(error);
}

function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    const statusCode = err.statusCode === 200 ? 500 : err.statusCode;
    return res.status(statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
      stack: env.NODE_ENV === "production" ? "🍻" : err.stack,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "Validation failed",
        details: err.issues, // or err.errors
      },
      stack: env.NODE_ENV === "production" ? "🍻" : err.stack,
    });
  }

  return res.status(500).json({
    success: false,
    error: { code: ERROR_CODES.INTERNAL_ERROR, message: err.message },
    stack: env.NODE_ENV === "production" ? "🍻" : err.stack,
  });
}

export { errorHandler, notFound };
