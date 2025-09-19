import { v4 as uuidv4 } from "uuid";
import { getTraceId } from "../utils/context.js";

class Event {
  constructor(message, data) {
    this.id = getTraceId() || uuidv4();
    this.message = message || "Event published";
    this.data = data || {};
    this.publishedAt = new Date().toISOString();
  }

  toString() {
    return JSON.stringify(this);
  }

  static fromData(data, message) {
    return new Event(message, data);
  }
}

export default Event;
