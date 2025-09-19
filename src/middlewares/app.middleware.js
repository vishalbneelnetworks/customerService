import { safeLogger } from "../utils/index.js";
import rateLimit from "express-rate-limit";
import { v4 as uuidv4, validate as validateUuid } from "uuid";
import { runWithContext } from "../utils/context.js";
import helmet from "helmet";
import env from "../config/index.js";
import cors from "cors";

export const correlationIdMiddleware = (req, res, next) => {
  let correlationId = req.headers["x-correlation-id"];
  let traceId = req.headers["x-trace-id"];

  if (correlationId && !validateUuid(correlationId)) {
    correlationId = uuidv4();
  }

  if (!correlationId) {
    correlationId = uuidv4();
  }

  if (traceId && !validateUuid(traceId)) {
    traceId = uuidv4();
  }

  req.correlationId = correlationId;
  req.traceId = traceId;
  res.setHeader("x-correlation-id", correlationId);
  res.setHeader("x-trace-id", traceId);

  const context = {
    correlationId,
    traceId,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  };
  runWithContext(context, () => {
    next();
  });
};

export const loggingMiddleware = (req, res, next) => {
  const correlationId = req.correlationId;
  const startTime = Date.now();

  safeLogger.info("Request started", {
    correlationId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    safeLogger.info("Request completed", {
      correlationId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || "anonymous",
    });
  });

  res.on("close", () => {
    if (!res.finished) {
      const duration = Date.now() - startTime;
      safeLogger.warn("Request aborted", {
        correlationId,
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        userId: req.user?.id || "anonymous",
        reason: "client disconnect",
      });
    }
  });

  next();
};

export const rateLimitMiddleware = (options = {}) => {
  const { windowMs = 15 * 60 * 1000, max = 100 } = options;
  return rateLimit({
    windowMs,
    max,
    message: {
      error: "Rate limit exceeded",
      message: "Too many requests from this IP",
      retryAfter: "15 minutes",
      correlationId: (req) => req.correlationId,
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      safeLogger.warn("Rate limit exceeded", {
        correlationId: req.correlationId,
        ip: req.ip,
        path: req.path,
      });
      res.status(429).json(req.rateLimit);
    },
  });
};

export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

export const errorMiddleware = (error, req, res, next) => {
  const correlationId = req.correlationId;

  safeLogger.error("Error occurred", {
    correlationId,
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id || "anonymous",
  });

  return res.status(error.statusCode || 500).json({
    error: error.name || "Internal Error",
    message: error.message || "Something went wrong",
    correlationId,
    ...(env.nodeEnv === "development" && { stack: error.stack }),
  });
};

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowedOrigins = env.corsOrigins;

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true,
  exposedHeaders: ["X-Correlation-ID"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Correlation-ID"],
});
