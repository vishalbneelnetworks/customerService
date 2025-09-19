import env from "./config/index.js";
import { app } from "./app.js";
import { initSqlDatabase, closeSqlDatabase } from "./db/sequalize.js";
import { initRedis, closeRedis } from "./db/redis.js";
import { initializeEvents, shutdownEvents } from "./events/index.js";
import { safeLogger } from "./utils/index.js";
import { connectMongodb, closeMongodb } from "./db/mongoose.js";

async function initializeServices() {
  try {
    // await initSqlDatabase();
    await connectMongodb();
    await initRedis();
    await initializeEvents();
    safeLogger.info("All services initialized successfully");
  } catch (error) {
    safeLogger.error("Service initialization failed", { error: error.message });
    throw error;
  }
}

async function startServer() {
  try {
    safeLogger.info("Starting Customer Service...", { port: env.server.port });
    await initializeServices();

    const server = app.listen(env.server.port, () => {
      safeLogger.info("Server running", { port: env.server.port });
    });

    const gracefulShutdown = async (signal) => {
      try {
        server.close();
        // await closeSqlDatabase();
        await closeMongodb();
        await closeRedis();
        await shutdownEvents();
        safeLogger.info("Graceful shutdown completed");
        process.exit(0);
      } catch (error) {
        safeLogger.error("Shutdown error", { error: error.message });
        process.exit(1);
      }
    };

    ["SIGINT", "SIGTERM"].forEach((signal) => {
      process.on(signal, () => gracefulShutdown(signal));
    });

    process.on("uncaughtException", (err) => {
      safeLogger.error("Uncaught Exception", { error: err.message });
      process.exit(1);
    });

    process.on("unhandledRejection", (reason) => {
      safeLogger.error("Unhandled Rejection", { reason });
      process.exit(1);
    });

    return server;
  } catch (err) {
    safeLogger.error("Startup failed", { error: err.message });
    process.exit(1);
  }
}

startServer();
export { startServer };
