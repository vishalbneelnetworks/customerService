import { Router } from "express";
import {
  createServiceController,
  getServiceController,
  getServicesController,
  updateServiceController,
  deleteServiceController,
} from "./offerings.controller.js";

import {
  createSubServiceController,
  getSubServiceController,
  getSubServicesController,
  updateSubServiceController,
  deleteSubServiceController,
  getSubServicesByServiceIdController,
} from "./offerings.controller.js";

const serviceRouter = Router();
const subServiceRouter = Router();

// Service routes
serviceRouter.post("/", createServiceController);
serviceRouter.get("/:serviceId", getServiceController);
serviceRouter.get("/", getServicesController);
serviceRouter.put("/:serviceId", updateServiceController);
serviceRouter.delete("/:serviceId", deleteServiceController);

// SubService routes
subServiceRouter.post("/:serviceId", createSubServiceController);
subServiceRouter.get("/:subServiceId", getSubServiceController);
subServiceRouter.get("/", getSubServicesController);
subServiceRouter.put("/:subServiceId", updateSubServiceController);
subServiceRouter.delete("/:subServiceId", deleteSubServiceController);
subServiceRouter.get(
  "/service/:serviceId",
  getSubServicesByServiceIdController
);

export { serviceRouter, subServiceRouter };
