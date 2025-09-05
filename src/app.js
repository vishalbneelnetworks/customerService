import express from "express";
import cookieParser from "cookie-parser";
import {
  correlationIdMiddleware,
  enterpriseLoggingMiddleware,
  enterpriseSecurityMiddleware,
  enterpriseValidationMiddleware,
  enterpriseErrorHandler,
  enterpriseCorsMiddleware,
  enterpriseRateLimit,
} from "./shared/middlewares/enterprise.middleware.js";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

//  app.use(correlationIdMiddleware);
// app.use(enterpriseLoggingMiddleware);
// app.use(enterpriseRateLimit);
// app.use(enterpriseSecurityMiddleware);
// app.use(enterpriseValidationMiddleware);

// app.use(enterpriseCorsMiddleware);

//imports
import formRoutes from "./modules/forms/index.js";
import offeringsRoutes from "./modules/offerings/index.js";

//use
app.use("/api/v1", formRoutes, offeringsRoutes);

//routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "no route found" });
});

//  app.use(enterpriseErrorHandler);
export default app;
