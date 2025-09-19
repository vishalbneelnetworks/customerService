class ApiResponse {
  constructor(statusCode, data, message, details = undefined) {
    const numericStatusCode = Number(statusCode);

    if (
      isNaN(numericStatusCode) ||
      numericStatusCode < 100 ||
      numericStatusCode > 599
    ) {
      throw new Error("Invalid HTTP status code. Must be between 100 and 599");
    }

    this.statusCode = numericStatusCode;
    this.data = data;
    this.message = message || this.getDefaultMessage(statusCode);
    this.success = numericStatusCode >= 200 && numericStatusCode < 300;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  getDefaultMessage(statusCode) {
    const messages = {
      200: "OK",
      201: "Created",
    };
    return messages[statusCode] || "Response";
  }

  static success(data, message = "Success", details = undefined) {
    return new ApiResponse(200, data, message, details);
  }

  static created(
    data,
    message = "Resource created successfully",
    details = undefined
  ) {
    return new ApiResponse(201, data, message, details);
  }

  toString() {
    return `ApiResponse: ${this.statusCode} - ${this.message}`;
  }
}

export { ApiResponse };
