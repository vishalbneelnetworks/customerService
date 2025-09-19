import amqplib from "amqplib";
import { rabbitMQConfig } from "../config/index.js";
import { safeLogger as logger } from "../utils/index.js";

class RabbitMQConnection {
  constructor() {
    this.connection = null;
    this.setupChannel = null;
    this.mainChannel = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = rabbitMQConfig.retry.maxRetries;
    this.reconnectInterval = rabbitMQConfig.retry.retryDelay;
    this.retryMultiplier = rabbitMQConfig.retry.retryMultiplier;
  }

  async init() {
    if (this.connection) return;

    try {
      logger.info("Connecting to RabbitMQ...");
      this.connection = await amqplib.connect(rabbitMQConfig.url);
      this.setupChannel = await this.connection.createChannel();
      this.mainChannel = await this.connection.createChannel();
      this.reconnectAttempts = 0;
      logger.info("Successfully connected to RabbitMQ");

      this._setupEventListeners();
      await this.setupDeadLetterExchange();
      await this.setupDefaultExchanges();
      await this.setupDefaultQueues();
    } catch (error) {
      logger.error(`Failed to connect to RabbitMQ: ${error.message}`);
      await this._handleReconnect();
    }
  }

  _setupEventListeners() {
    this.connection.on("error", async (error) => {
      logger.error(`RabbitMQ connection error: ${error.message}`);
      await this._handleReconnect();
    });

    this.connection.on("close", async () => {
      logger.warn("RabbitMQ connection closed");
      await this._handleReconnect();
    });
  }

  async _handleReconnect() {
    if (this.connection) {
      try {
        await this.connection.close();
      } catch {}
      this.connection = null;
    }
    if (this.setupChannel) {
      try {
        await this.setupChannel.close();
      } catch {}
      this.setupChannel = null;
    }
    if (this.mainChannel) {
      try {
        await this.mainChannel.close();
      } catch {}
      this.mainChannel = null;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay =
        this.reconnectInterval *
        Math.pow(this.retryMultiplier, this.reconnectAttempts - 1);
      logger.info(
        `Reconnecting in ${delay}ms... (Attempt ${this.reconnectAttempts})`
      );
      setTimeout(() => this.init(), delay);
    } else {
      logger.error(
        `Failed after ${this.maxReconnectAttempts} attempts. Manual restart required.`
      );
    }
  }

  async getSetupChannel() {
    if (!this.connection || !this.setupChannel) {
      await this.init();
    }
    return this.setupChannel;
  }

  async getMainChannel() {
    if (!this.connection || !this.mainChannel) {
      await this.init();
    }
    return this.mainChannel;
  }

  async setupDeadLetterExchange() {
    const channel = await this.getSetupChannel();
    if (!channel) {
      await this.init();
    }
    const { name, type, queue, routingKey, queueOptions, enable } =
      rabbitMQConfig.deadLetterExchange;
    if (!enable) return;
    await channel.assertExchange(name, type, { durable: true });
    await channel.assertQueue(queue, queueOptions || { durable: true });
    await channel.bindQueue(queue, name, routingKey);
    logger.info(`Dead letter exchange '${name}' and queue '${queue}' set up.`);
  }

  async setupDefaultExchanges() {
    const channel = await this.getSetupChannel();
    if (!channel) {
      await this.init();
    }
    for (const exchange of rabbitMQConfig.exchanges) {
      await channel.assertExchange(
        exchange.name,
        exchange.type,
        exchange.options
      );
      logger.info(`Exchange '${exchange.name}' set up.`);
    }
  }

  async setupDefaultQueues() {
    const channel = await this.getSetupChannel();
    if (!channel) {
      await this.init();
    }
    for (const queueConfig of rabbitMQConfig.queues) {
      await channel.assertQueue(queueConfig.name, queueConfig.options);
      for (const binding of queueConfig.bindings) {
        await channel.bindQueue(
          queueConfig.name,
          binding.exchange,
          binding.routingKey
        );
      }
      logger.info(`Queue '${queueConfig.name}' set up and bound.`);
    }
  }

  async publish(exchangeName, routingKey, content, options = {}) {
    const channel = await this.getMainChannel();
    if (!channel) {
      await this.init();
    }
    const buffer = Buffer.from(JSON.stringify(content));
    const publishOptions = { persistent: true, ...options };
    const result = channel.publish(
      exchangeName,
      routingKey,
      buffer,
      publishOptions
    );
    if (result) {
      logger.info(
        `Message published to '${exchangeName}' with key '${routingKey}'.`
      );
    } else {
      logger.warn(
        `Publish failed to '${exchangeName}' with key '${routingKey}'.`
      );
    }
    return result;
  }

  async consume(queueName, callback, options = {}) {
    const channel = await this.getMainChannel();
    if (!channel) {
      await this.init();
    }
    if (rabbitMQConfig.consumerOptions.prefetch) {
      await channel.prefetch(rabbitMQConfig.consumerOptions.prefetch);
    }
    const consumeOptions = { noAck: false, ...options };
    const { consumerTag } = await channel.consume(
      queueName,
      async (msg) => {
        if (!msg) return;
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content, msg, channel);
          if (!consumeOptions.noAck) channel.ack(msg);
        } catch (error) {
          logger.error(`Error processing '${queueName}': ${error.message}`);
          if (!consumeOptions.noAck) channel.nack(msg, false, false);
        }
      },
      consumeOptions
    );
    logger.info(
      `Consumer started for '${queueName}' with tag '${consumerTag}'.`
    );
    return consumerTag;
  }

  async cancelConsumer(consumerTag) {
    const channel = await this.getMainChannel();
    await channel.cancel(consumerTag);
    logger.info(`Consumer '${consumerTag}' cancelled.`);
  }

  isHealthy() {
    return !!this.connection && !!this.setupChannel && !!this.mainChannel;
  }

  async close() {
    if (this.setupChannel) {
      await this.setupChannel.close();
      this.setupChannel = null;
    }
    if (this.mainChannel) {
      await this.mainChannel.close();
      this.mainChannel = null;
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
    logger.info("RabbitMQ connection closed.");
  }
}

const rabbitMQConnection = new RabbitMQConnection();
export default rabbitMQConnection;
