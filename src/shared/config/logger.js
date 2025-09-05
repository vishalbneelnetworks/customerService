import winston from "winston";

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

winston.addColors(logColors);

const createLogFormat = (includeColors = false) => {
  const formats = [
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss.SSS",
    }),
    winston.format.errors({ stack: true }),
    winston.format.metadata({
      fillExcept: ["message", "level", "timestamp"],
    }),
  ];

  if (includeColors) {
    formats.push(winston.format.colorize({ all: true }));
  }

  formats.push(
    winston.format.printf(
      ({ timestamp, level, message, stack, metadata, ...rest }) => {
        const logEntry = {
          timestamp,
          level: level.toUpperCase(),
          message,
          ...metadata,
          ...rest,
        };

        if (stack) {
          logEntry.stack = stack;
        }

        return JSON.stringify(logEntry);
      }
    )
  );

  return winston.format.combine(...formats);
};

const consoleTransport = new winston.transports.Console({
  level: process.env.LOG_LEVEL || "info",
  format:
    process.env.NODE_ENV === "production"
      ? winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        )
      : winston.format.combine(
          winston.format.colorize({
            all: true,
            colors: logColors,
          }),
          winston.format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss.SSS",
          }),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length
              ? JSON.stringify(meta, null, 2)
              : "";
            return `${timestamp} [${level}]: ${message} ${metaStr}`;
          })
        ),
  handleExceptions: true,
  handleRejections: true,
});

const fileTransport =
  process.env.NODE_ENV === "production"
    ? new winston.transports.File({
        filename: "logs/app.log",
        level: "info",
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        ),
        maxsize: 10485760, // 10MB
        maxFiles: 10,
        tailable: true,
      })
    : new winston.transports.File({
        filename: "logs/error.log",
        level: "error",
        format: createLogFormat(false),
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      });

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  levels: logLevels,
  format: createLogFormat(true),
  transports: [consoleTransport, fileTransport],
  exitOnError: false,
});

export const safeLogger = {
  error: (message, meta = {}) => logger.error(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  info: (message, meta = {}) => logger.info(message, meta),
  http: (message, meta = {}) => logger.http(message, meta),
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== "production") {
      logger.debug(message, meta);
    }
  },

  logWithCorrelation: (level, message, correlationId, meta = {}) => {
    logger[level](message, { correlationId, ...meta });
  },
};

export default logger;
