import EventBus from "./EventBus.js";
import MessageBroker from "./MessageBroker.js";
import rabbitMQConnection from "./connection.js";

export const eventBus = new EventBus();

class EventComponents {
  constructor() {
    this.isRunning = false;
    this.components = {};
  }

  async start() {
    try {
      console.log("🚀 Starting Event Components...");

      await rabbitMQConnection.init();

      await this.initializeCoreModules();

      this.isRunning = true;
      console.log("✅ Event Components started successfully!");
    } catch (error) {
      console.error("❌ Failed to start Event Components:", error.message);
      await this.shutdown();
      throw error;
    }
  }

  async initializeCoreModules() {
    this.components.eventBus = eventBus;

    this.components.messageBroker = new MessageBroker(this.components.eventBus);
    await this.components.messageBroker.initialize();
    console.log("✅ Core modules initialized");
  }

  displaySystemStatus() {
    console.log("\n📊 System Status:");
    console.log("================");

    const eventBusStats = this.components.eventBus.getStats();
    console.log(
      `🔥 EventBus: ${eventBusStats.totalListeners} listeners, ${eventBusStats.eventTypes} event types`
    );

    const messageBrokerStats = this.components.messageBroker.getStats();
    console.log(
      `🎯 MessageBroker: ${messageBrokerStats.totalConsumers} consumers, ${messageBrokerStats.totalPublishers} publishers`
    );

    console.log("================\n");
  }

  async getSystemHealth() {
    const health = {
      system: {
        status: this.isRunning ? "running" : "stopped",
        uptime: this.isRunning ? Date.now() - this.startTime : 0,
        timestamp: new Date().toISOString(),
      },
      components: {},
      agents: {},
      statistics: {},
    };

    try {
      health.components.eventBus = this.components.eventBus.getStats();
      health.components.messageBroker =
        await this.components.messageBroker.healthCheck();

      // System statistics
      health.statistics.recentActivity =
        this.components.messageBroker.getRecentActivity(10);
    } catch (error) {
      health.error = error.message;
    }

    return health;
  }

  getSystemStats() {
    return {
      eventBus: this.components.eventBus.getStats(),
      messageBroker: this.components.messageBroker.getStats(),
    };
  }

  async shutdown() {
    if (!this.isRunning) {
      return;
    }

    console.log("🔻 Shutting down Event-Driven System...");

    try {
      await this.components.messageBroker?.stop();

      this.components.eventBus?.clear();

      this.isRunning = false;
      console.log("✅ System shutdown complete");
    } catch (error) {
      console.error("❌ Error during shutdown:", error.message);
    }
  }

  setupShutdownHandlers() {
    const gracefulShutdown = async (signal) => {
      console.log(`\n📞 Received ${signal}, initiating graceful shutdown...`);
      await this.shutdown();
      process.exit(0);
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  }

  get eventBus() {
    return this.components.eventBus;
  }
}

export const eventComponents = new EventComponents();
