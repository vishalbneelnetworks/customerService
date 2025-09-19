import { AsyncLocalStorage } from "async_hooks";

const asyncLocalStorage = new AsyncLocalStorage();

export const runWithContext = (context, callback) => {
  return asyncLocalStorage.run(context, callback);
};

export const getContext = () => {
  return asyncLocalStorage.getStore() || {};
};

export const getCorrelationId = () => {
  const context = getContext();
  return context.correlationId || "unknown";
};

export const getTraceId = () => {
  const context = getContext();
  return context.traceId || "unknown";
};
