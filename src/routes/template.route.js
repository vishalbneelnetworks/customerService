import { Router } from "express";
import {
  createTemplateController,
  getTemplatesController,
  getTemplateByIdController,
  updateTemplateController,
  deleteTemplateController,
  toggleTemplateStatusController,
  getProjectTypesWithSubTypesController,
  getTemplateByProjectSubTypeController,
} from "../controllers/template.controller.js";

const router = Router();

// New optimized routes
router.get(
  "/project-types-with-subtypes",
  getProjectTypesWithSubTypesController
);
router.get(
  "/project-types/:projectType/:subProjectType",
  getTemplateByProjectSubTypeController
);

// Existing routes
router.get("/", getTemplatesController);
router.post("/", createTemplateController);
router.get("/:templateId", getTemplateByIdController);
router.patch("/:templateId", updateTemplateController);
router.delete("/:templateId", deleteTemplateController);
router.patch("/:templateId/toggle-status", toggleTemplateStatusController);

export default router;
