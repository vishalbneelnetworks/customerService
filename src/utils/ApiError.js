class ApiError extends Error {
  constructor(statusCode, message, errors = undefined, stack = "") {
    const numericStatusCode = Number(statusCode);

    if (isNaN(numericStatusCode)) {
      throw new Error("Invalid HTTP status code");
    }

    super(message || "API Error");

    this.name = "ApiError";
    this.statusCode = numericStatusCode;
    this.success = false;
    this.errors = errors;
    this.timestamp = new Date().toISOString();

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toString() {
    return `ApiError: ${this.message}`;
  }
}

export { ApiError };
