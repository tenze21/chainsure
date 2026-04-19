import { logger } from "@config/logger";
import pinoHttp from "pino-http";

export function pinoLogger() {
  return pinoHttp({ logger });
}
