import rabbitMQ from "./connection.js";
import Event from "./event.js";

export const publishFormGenerateLead = async (form) => {
  const event = Event.fromData(form, "generate-lead");
  try {
    const result = await rabbitMQ.publish(
      "customer-service.events",
      "form.generate-lead.v1",
      event
    );
    if (!result) {
      throw new Error("Failed to publish form generate lead event");
    }
    return result;
  } catch (error) {
    throw new Error(
      `Failed to publish form generate lead event: ${error.message}`,
      {
        cause: error,
      }
    );
  }
};

export const publishFormNotifyCustomer = async (form) => {
  const event = Event.fromData(form, "notify-customer");
  try {
    const result = await rabbitMQ.publish(
      "customer-service.events",
      "form.notify-customer.v1",
      event
    );
    if (!result) {
      throw new Error("Failed to publish form notify customer event");
    }
    return result;
  } catch (error) {
    throw new Error(
      `Failed to publish form notify customer event: ${error.message}`,
      {
        cause: error,
      }
    );
  }
};
