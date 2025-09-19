import Redis from "ioredis";
import env from "../config/index.js";
import { safeLogger } from "../utils/index.js";

let redis;

export async function initRedis() {
  return new Promise((resolve, reject) => {
    if (redis) return resolve(redis);

    redis = new Redis({
      host: env.redis.host,
      port: env.redis.port,
      password: env.redis.password,
      retryStrategy: env.redis.retryStrategy,
      maxRetriesPerRequest: env.redis.maxRetriesPerRequest,
      enableReadyCheck: env.redis.enableReadyCheck,
      reconnectOnError: env.redis.reconnectOnError,
    });

    redis.on("connect", () => {
      safeLogger.info("✅ Redis connected");
    });

    redis.on("ready", () => {
      safeLogger.info("🚀 Redis client is ready");
      resolve(redis);
    });

    redis.on("error", (err) => {
      const message =
        err.code === "ECONNREFUSED"
          ? "❌ Redis connection refused"
          : "❌ Redis encountered an error";

      safeLogger.error(message, {
        message: err.message,
        stack: err.stack,
        code: err.code,
      });

      if (env.nodeEnv === "development") {
        safeLogger.warn(
          "Development mode: Redis connection failed, continuing without Redis"
        );
        resolve(null);
      } else {
        reject(err);
      }
    });
  });
}

export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}

export function getRedisClient() {
  if (!redis) {
    const errorMsg = "Redis client not initialized. Call initRedis() first.";
    safeLogger.error(errorMsg);
    throw new Error(errorMsg);
  }
  return redis;
}
