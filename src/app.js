import express from "express";

import cookieParser from "cookie-parser";
import compression from "compression";

import {
  correlationIdMiddleware,
  loggingMiddleware,
  rateLimitMiddleware,
  securityMiddleware,
  errorMiddleware,
  corsMiddleware,
} from "./middlewares/app.middleware.js";

const app = express();

app.use(compression());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser());

app.use(securityMiddleware);
app.use(corsMiddleware);
app.use(correlationIdMiddleware);
app.use(rateLimitMiddleware());
app.use(loggingMiddleware);

import formRoutes from "./routes/form.routes.js";
import serviceRoutes from "./routes/service.routes.js";

app.use("/api/v1/forms", formRoutes);
app.use("/api/v1/services", serviceRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.url}`,
    correlationId: req.correlationId,
  });
});

app.use(errorMiddleware);

export { app };
