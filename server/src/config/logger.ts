import { createWriteStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import env from "@config/env";
import pino from "pino";

const isDevelopment = env.NODE_ENV === "development";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
