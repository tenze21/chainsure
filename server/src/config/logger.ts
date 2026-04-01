import { createWriteStream } from "node:fs";
import path from "node:path";
import env from "@config/env";
import pino from "pino";

const isDevelopment = env.NODE_ENV === "development";

// Export the raw logger so it can be imported anywhere
export const logger = isDevelopment
  ? pino({
      level: env.LOG_LEVEL,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
        },
      },
    })
  : pino(
      { level: "info" },
      createWriteStream(path.join(__dirname, "../../logs/app.log"), { flags: "a" }),
    );
