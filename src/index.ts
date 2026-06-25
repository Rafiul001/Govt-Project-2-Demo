import config from "@/server/config";
import app from "@/server/server";
import logger from "@/shared/utils/pino-logger";
import { serve } from "@hono/node-server";

const server = serve({ fetch: app.fetch, port: config.PORT }, (info) => {
  logger.info(`Server running at http://localhost:${info.port}`);
});

let shuttingDown = false;

function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`${signal} received, shutting down gracefully...`);

  // Force exit if connections don't close in time.
  const forceTimeout = setTimeout(() => {
    logger.error("Could not close connections in time, forcing shutdown");
    process.exit(1);
  }, 10_000);
  forceTimeout.unref();

  server.close((err) => {
    if (err) {
      logger.error({ err }, "Error during shutdown");
      process.exit(1);
    }
    logger.info("Server closed");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
