import rabbitMQ from "./connection.js";
import * as handlers from "./handler.js";
import { safeLogger } from "../utils/index.js";

const consumerTags = new Set();
export const startConsumers = async () => {
  try {
    const consumerTag = await rabbitMQ.consume(
      "customer-service.main",
      async (content, msg) => {
        const routingKey = msg.fields.routingKey;
        switch (routingKey) {
          case "form.notify-customer.v1":
            await handlers.notifyCustomerHandler(content);
            break;
          default:
            safeLogger.warn("Unknown routing key:", routingKey);
        }
      }
    );
    consumerTags.add(consumerTag);
    safeLogger.info(`Started consumer with tag: ${consumerTag}`);
  } catch (error) {
    safeLogger.error("Failed to start consumers", { message: error.message });
    throw error;
  }
};

export const stopConsumers = async () => {
  try {
    for (const tag of consumerTags) {
      await rabbitMQ.cancelConsumer(tag);
      consumerTags.delete(tag);
      safeLogger.info(`Stopped consumer with tag: ${tag}`);
    }
  } catch (error) {
    safeLogger.error("Failed to stop consumers", { message: error.message });
    throw error;
  }
};
