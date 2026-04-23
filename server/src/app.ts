import type { Request, Response } from "express";
import env from "@config/env";
import { startMintingJob } from "@jobs/nft-minting-job";
import { errorHandler, notFound } from "@middlewares/error-handler";
import { pinoLogger } from "@middlewares/pino-logger";
import { apiLimiter } from "@middlewares/rate-limit-middleware";
import authRoutes from "@routes/auth-routes";
import claimRoutes from "@routes/claim-routes";
import paymentRoutes from "@routes/payment-routes";
import policyRoutes from "@routes/policy-routes";
import templateRoutes from "@routes/policy-template-routes";
import proposalRoutes from "@routes/proposal-routes";
import subscriptionRoutes from "@routes/subscription-routes";
import userRoutes from "@routes/user-routes";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { authenticate } from "@/middlewares/auth-middleware";
import "@/database/models/index";

/*
  A background job that queries the database for policies with `payment_confirmed`
  status and mints an associted NFT for the policy.
*/
startMintingJob();

const app = express();

app.use(helmet());

const logger = pinoLogger();
app.use(logger);

app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(cookieParser());

app.use("/api/stripe", paymentRoutes);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(apiLimiter);

app.get("/api", (_req: Request, res: Response) => {
  res.json({
    message: "Welcome to Chainsure API",
    version: "1.0.0",
    documentation: "/api/docs",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/template", templateRoutes);
app.use("/api/proposal", authenticate, proposalRoutes);
app.use("/api/policy", authenticate, policyRoutes);
app.use("/api/user", authenticate, userRoutes);
app.use("/api/subscriptions", authenticate, subscriptionRoutes);
app.use("/api/claim", authenticate, claimRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
