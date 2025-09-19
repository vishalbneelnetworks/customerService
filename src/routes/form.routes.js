import { Router } from "express";
import {
  submitForm,
  getFormById,
  getFormsByCustomerId,
  getAllForms,
  deleteFormById,
} from "../controllers/form.controller.js";
import { requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/")
  .post(requireRole("admin", "customer"), submitForm)
  .get(requireRole("admin"), getAllForms);

router
  .route("/:id")
  .get(requireRole("admin", "customer", "superadmin"), getFormById)
  .delete(requireRole("admin"), deleteFormById);

router
  .route("/customer/:customerId")
  .get(requireRole("admin", "customer"), getFormsByCustomerId);

export default router;
