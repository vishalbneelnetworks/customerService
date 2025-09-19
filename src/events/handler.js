import { safeLogger } from "../utils/index.js";

export const notifyCustomerHandler = async (content) => {
  safeLogger.info("Notify customer", content);
};
