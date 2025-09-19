import { startConsumers, stopConsumers } from "./consumer.js";
import { safeLogger } from "../utils/index.js";
import rabbitMQConnection from "./connection.js";

async function initializeEvents() {
  try {
    await rabbitMQConnection.init();
    await startConsumers();
    safeLogger.info("All consumers started");
  } catch (error) {
    safeLogger.error("Failed to initialize events", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

async function shutdownEvents() {
  try {
    await rabbitMQConnection.close();
    await stopConsumers();
  } catch (error) {
    safeLogger.error("Failed to shutdown events", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

export { initializeEvents, shutdownEvents };
