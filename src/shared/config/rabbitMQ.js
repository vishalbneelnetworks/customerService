import { env } from "./env.js";

const EXCHANGE_TYPES = {
  DIRECT: "direct",
  FANOUT: "fanout",
  TOPIC: "topic",
  HEADERS: "headers",
};

if (!env.RABBITMQ_URL) {
  throw new Error("RABBITMQ_URL is required in .env file");
}

const rabbitMQConfig = {
  url: env.RABBITMQ_URL,

  connectionOptions: {
    heartbeat: 60,
    timeout: 30000,
  },

  exchanges: {
    form: {
      name: "form.exchange",
      type: EXCHANGE_TYPES.DIRECT,
      options: {
        durable: true,
        autoDelete: false,
      },
    },
  },

  queues: {},

  channels: {
    formSubmission: {
      name: "form_submission_channel",
      options: {
        durable: true,
      },
    },
  },

  consumerOptions: {
    prefetch: 10,
    noAck: false,
  },

  deadLetterExchange: {
    name: "customer.dlx",
    type: EXCHANGE_TYPES.DIRECT,
    queue: "customer.dlq",
    routingKey: "customer.failed",
    queueOptions: {
      durable: true,
      messageTtl: 604800000,
    },
  },

  retryMechanism: {
    maxRetries: 3,
    initialInterval: 1000,
    multiplier: 2,
    attemptTimeout: 5000,
  },
};

export const messageFlow = {
  form: {
    exchange: "form.exchange",
    routingKey: "form.submitted",
  },
};

export default rabbitMQConfig;
