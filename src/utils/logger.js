import winston from "winston";
import env from "../config/index.js";

const createLogger = () => {
  const consistentFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...meta,
      });
    })
  );

  const transports = [
    new winston.transports.Console({
      level: env.logging.level,
      format:
        env.nodeEnv === "production"
          ? consistentFormat
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            ),
    }),
  ];

  if (env.logging.enableFile) {
    transports.push(
      new winston.transports.File({
        filename: env.logging.filename,
        level: env.logging.level,
        format: consistentFormat,
      })
    );
  }

  return winston.createLogger({
    level: env.logging.level,
    transports,
    exitOnError: false,
  });
};

const logger = createLogger();

export const safeLogger = {
  error: (message, meta = {}) => logger.error(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  info: (message, meta = {}) => logger.info(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),
};

export default logger;
