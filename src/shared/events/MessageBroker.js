import rabbitMQConnection from "./connection.js";
import rabbitMQConfig, { messageFlow } from "../config/rabbitMQ.js";

class MessageBroker {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.connection = rabbitMQConnection;
    this.isConnected = false;
    this.subscriptions = new Map();
    this.publishChannels = new Map();
  }

  async initialize() {
    if (!this.connection.isConnected) {
      console.log(
        "RabbitMQ connection not established, skipping MessageBroker initialization"
      );
      return;
    }
    try {
      this.isConnected = true;
      this.setupEventListeners();
      await this.startConsuming();
    } catch (error) {
      console.error("❌ MessageBroker: Failed to initialize:", error.message);
      throw error;
    }
  }

  setupEventListeners() {
    this.eventBus.on("form.created", this.handleFormSubmission.bind(this));
  }

  async startConsuming() {
    try {
      // later we will add the code to consume from the queues
      console.log("🎧 MessageBroker: Started consuming from RabbitMQ queues");
    } catch (error) {
      console.error(
        "❌ MessageBroker: Failed to start consuming:",
        error.message
      );
      throw error;
    }
  }

  async consumeFromQueue(channelName, queueName, handler) {
    const consumerTag = await this.connection.consume(
      channelName,
      queueName,
      handler,
      rabbitMQConfig.connectionOptions
    );

    this.subscriptions.set(queueName, { channelName, consumerTag });
  }

  async publishToQueue(
    channelName,
    exchange,
    routingKey,
    message,
    options = {}
  ) {
    if (!this.isConnected) {
      throw new Error("MessageBroker not connected to RabbitMQ");
    }

    try {
      await this.connection.publish(
        channelName,
        exchange,
        routingKey,
        message,
        options
      );
    } catch (error) {
      console.error("❌ MessageBroker: Failed to publish:", error.message);
      throw error;
    }
  }

  async handleFormSubmission(event) {
    const { newForm, startTime } = event.data;
    try {
      await this.publishToQueue(
        rabbitMQConfig.channels.formSubmission.name,
        messageFlow.form.exchange,
        messageFlow.form.routingKey,
        newForm
      );
      console.log(
        `🔍 MessageBroker published the form created in ${
          new Date() - startTime
        }ms`
      );
    } catch (error) {
      console.error(
        "❌ MessageBroker: Failed to handle form submission:",
        error.message
      );
      throw error;
    }
  }

  getStats() {
    return {
      isConnected: this.isConnected,
      activeSubscriptions: this.subscriptions.size,
      subscriptions: Array.from(this.subscriptions.keys()),
      publishChannels: this.publishChannels.size,
    };
  }

  async stop() {
    try {
      // Stop all consumers
      for (const [queueName, { channelName, consumerTag }] of this
        .subscriptions) {
        await this.connection.cancelConsumer(channelName, consumerTag);
      }

      this.subscriptions.clear();
      this.publishChannels.clear();
      this.isConnected = false;
    } catch (error) {
      console.error("❌ MessageBroker: Error during stop:", error.message);
    }
  }

  async healthCheck() {
    return {
      component: "MessageBroker",
      status: this.isConnected ? "healthy" : "disconnected",
      subscriptions: this.subscriptions.size,
      timestamp: new Date().toISOString(),
    };
  }
}

export default MessageBroker;
