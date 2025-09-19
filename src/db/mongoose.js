import mongoose from "mongoose";
import env from "../config/index.js";
import { safeLogger } from "../utils/index.js";

export const connectMongodb = async () => {
  try {
    const connection = await mongoose.connect(
      `${env.mongodb.uri}/${env.mongodb.database}`
    );
    safeLogger.info("MongoDB connection established");
  } catch (err) {
    safeLogger.error("MongoDB connection failed", { error: err.message });
    throw err;
  }
};

export const closeMongodb = async () => {
  try {
    await mongoose.connection.close();
    safeLogger.info("MongoDB connection closed");
  } catch (err) {
    safeLogger.error("Error closing MongoDB connection", {
      error: err.message,
    });
  }
};

export default mongoose;
