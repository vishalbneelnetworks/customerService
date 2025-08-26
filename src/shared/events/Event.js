import { v4 as uuidv4 } from "uuid";

class Event {
  constructor({ type, data, source, timestamp, id }) {
    this.id = id || uuidv4();
    this.type = type;
    this.data = data;
    this.timestamp = timestamp || Date.now();
    this.source = source || "system";
  }
}

export default Event;
