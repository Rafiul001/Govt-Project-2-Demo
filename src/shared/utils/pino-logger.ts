import config from "@/server/config";
import pino from "pino";

const isProduction = config.NODE_ENV === "production";

export const logger = pino({
  level: config.LOG_LEVEL,
  // Pretty, human-readable output in development; structured JSON in production.
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
});

export default logger;
