import type { RequestUserData } from "@/lib/types";

declare global {
  namespace Express {
    interface Request {
      /**
       * Authenticated user (set by auth middleware)
       */
      user?: RequestUserData;

      /**
       * Rate limit info (set by rate limit middleware)
       */
      rateLimit?: {
        limit: number;
        remaining: number;
        reset: Date;
      };
    }
  }
}

export {};
