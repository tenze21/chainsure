import type { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoLogger } from "@/middlewares/pino-logger";

const app = express();

app.use(helmet());

const logger = pinoLogger();
app.use(logger);

app.use(cors());

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/api", (_req: Request, res: Response) => {
  res.json({
    message: "Welcome to Chainsure API",
    version: "1.0.0",
    documentation: "/api/docs",
  });
});
export default app;
