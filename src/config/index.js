import { config } from "dotenv";
import { validateEnvType } from "../utils/validateEnv.js";
import { rabbitMQConfig } from "./rabbitmq.js";

config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  server: {
    port: validateEnvType(process.env.PORT, "number", 3003),
    host: process.env.HOST || "localhost",
    version: process.env.APP_VERSION || "1.0.0",
  },
  corsOrigins: process.env.CORS_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ],
  mysql: {
    host: process.env.DB_HOST || "localhost",
    port: validateEnvType(process.env.DB_PORT, "number", 3306),
    database: process.env.DB_NAME || "customer_service",
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    dialect: process.env.DB_DIALECT || "mysql",
  },
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017",
    database: process.env.MONGODB_DATABASE || "customer_service",
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: validateEnvType(process.env.REDIS_PORT, "number", 6379),
    password: process.env.REDIS_PASSWORD || "",
    db: validateEnvType(process.env.REDIS_DB, "number", 0),
    retryStrategy: (times) => Math.min(times * 50, 2000), // 2 seconds
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    reconnectOnError: (err) => err.message.includes("READONLY"),
  },
  grpc: {
    server: {
      host: process.env.GRPC_SERVER_HOST || "localhost",
      port: validateEnvType(process.env.GRPC_SERVER_PORT, "number", 50051),
    },
    client: {
      host: process.env.GRPC_CLIENT_HOST || "localhost",
      port: validateEnvType(process.env.GRPC_CLIENT_PORT, "number", 50050),
    },
  },
  auth: {
    jwksUrl:
      process.env.AUTH_SERVICE_JWKS_URL ||
      "http://localhost:3001/api/v1/jwk/.well-known/jwks.json",
    timeout: validateEnvType(process.env.AUTH_SERVICE_TIMEOUT, "number", 5000),
    retries: validateEnvType(process.env.AUTH_SERVICE_RETRIES, "number", 3),
    maxCacheAge: validateEnvType(
      process.env.AUTH_SERVICE_MAX_CACHE_AGE,
      "number",
      3600000
    ),
    cooldownDuration: validateEnvType(
      process.env.AUTH_SERVICE_COOLDOWN_DURATION,
      "number",
      30000
    ),
    issuer: process.env.AUTH_SERVICE_ISSUER || "bizpickr-auth-service",
    audience: process.env.AUTH_SERVICE_AUDIENCE || "bizpickr-services",
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
    enableFile: process.env.LOG_TO_FILE === "true",
    filename: process.env.LOG_FILE || "logs/app.log",
    enableConsole: true,
  },

  rabbitMQ: rabbitMQConfig,
};

export { rabbitMQConfig };

export default env;
