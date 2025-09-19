const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const RABBITMQ_VHOST = process.env.RABBITMQ_VHOST || "/";
const SERVICE_NAME = process.env.SERVICE_NAME || "customer-service";

export const rabbitMQConfig = {
  url: RABBITMQ_URL,
  connectionOptions: {
    vhost: RABBITMQ_VHOST,
    heartbeat: parseInt(process.env.RABBITMQ_HEARTBEAT) || 60,
    connectionTimeout: parseInt(process.env.RABBITMQ_TIMEOUT) || 30000,
    credentials: process.env.RABBITMQ_USER
      ? {
          username: process.env.RABBITMQ_USER,
          password: process.env.RABBITMQ_PASS,
        }
      : undefined,
  },

  retry: {
    maxRetries: parseInt(process.env.RABBITMQ_MAX_RETRIES) || 5,
    retryDelay: parseInt(process.env.RABBITMQ_RETRY_DELAY) || 2000,
    retryMultiplier: parseFloat(process.env.RABBITMQ_RETRY_MULTIPLIER) || 1.5,
  },

  deadLetterExchange: {
    enable: process.env.RABBITMQ_DLX_ENABLED === "true" || true,
    name: `${SERVICE_NAME}.dlx`,
    type: "direct",
    queue: `${SERVICE_NAME}.dlq`,
    routingKey: "dead-letter",
    queueOptions: {
      durable: true,
      arguments: {
        "x-message-ttl": 7 * 24 * 60 * 60 * 1000, // 7 days TTL
      },
    },
  },

  exchanges: [
    {
      name: `${SERVICE_NAME}.events`,
      type: "topic",
      options: {
        durable: true,
      },
    },
  ],

  queues: [
    {
      name: `${SERVICE_NAME}.main`,
      options: {
        durable: true,
        deadLetterExchange: `${SERVICE_NAME}.dlx`,
        deadLetterRoutingKey: "dead-letter",
      },
      bindings: [
        {
          exchange: `${SERVICE_NAME}.events`,
          routingKey: "#",
        },
      ],
    },
  ],

  consumerOptions: {
    prefetch: parseInt(process.env.RABBITMQ_PREFETCH) || 10,
    noAck: false,
  },
};
