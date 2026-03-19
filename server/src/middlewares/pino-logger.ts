import { createWriteStream } from "node:fs";
import path from "node:path";
import env from "@config/env";
import pino from "pino";
import pinoHttp from "pino-http";

const isDevelopment = env.NODE_ENV === "development";
export function pinoLogger() {
  const logger = isDevelopment
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
        {
          level: "info",
        },
        createWriteStream(path.join(__dirname, "../../logs/app.log"), { flags: "a" }),
      );

  return pinoHttp({ logger });
}
