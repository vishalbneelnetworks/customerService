import app from "./app.js";
import { env } from "./shared/config/env.js";
import { connectDb } from "./shared/db/connect.js";
import { safeLogger } from "./shared/config/logger.js";
import { eventComponents } from "./shared/events/index.js";

async function startServer() {
  try {
    await connectDb();
    safeLogger.info("✔️ Database connected");
    await eventComponents.start();

    const server = app.listen(env.PORT, () => {
      safeLogger.info(`⚙️ Server is running on port ${env.PORT}`);
    });

    const gracefulShutdown = async () => {
      safeLogger.info("🔻 Graceful shutdown initiated");
      await connectDb.close();
      await eventComponents.shutdown();
      server.close(() => {
        safeLogger.info("🧹 Express server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
  } catch (err) {
    safeLogger.error("❌ Startup failed", {
      message: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }
}

startServer();
