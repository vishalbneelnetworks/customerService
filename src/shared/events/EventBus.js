import Event from "./Event.js";

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(eventType, handler) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    this.listeners.get(eventType).push({
      handler,
      name: handler.name || "anonymous",
    });
  }

  off(eventType, handler) {
    if (this.listeners.has(eventType)) {
      const handlers = this.listeners.get(eventType);
      const filtered = handlers.filter((h) => h.handler !== handler);
      this.listeners.set(eventType, filtered);
    }
  }

  async emit(event) {
    if (!(event instanceof Event)) {
      throw new Error("EventBus.emit expects an Event instance");
    }
    console.log("🔍 EventBus: Emitting event:", event.type);

    const handlers = this.listeners.get(event.type) || [];
    handlers.forEach(async (handler) => {
      await this.safeExecuteHandler(handler, event);
    });
  }

  async safeExecuteHandler(handler, event) {
    const { name, handler: handlerFunction } = handler;
    try {
      await Promise.resolve(handlerFunction(event));
    } catch (error) {
      console.error(
        `❌ EventBus: Handler '${name}' failed for '${event.type}':`,
        error.message
      );
    }
  }

  getStats() {
    const listenerCount = Array.from(this.listeners.values()).reduce(
      (total, handlers) => total + handlers.length,
      0
    );

    return {
      totalListeners: listenerCount,
      eventTypes: this.listeners.size,
    };
  }

  clear() {
    this.listeners.clear();
  }
}

export default EventBus;
