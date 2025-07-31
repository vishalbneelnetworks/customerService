import express from "express";
import {
  createTemplateController,
  getTemplatesController,
  getTemplatesByTypeController,
  getTemplateByIdController,
  getBusinessTemplateController,
  getTechnicalTemplateController,
  getAdvancedFormTemplatesController,
  updateTemplateController,
  deleteTemplateController,
  toggleTemplateStatusController,
} from "../controllers/template.controller.js";

const router = express.Router();

router.post("/", createTemplateController);
router.get("/", getTemplatesController);

router.get(
  "/advanced/:projectType/:subProjectType",
  getAdvancedFormTemplatesController
);
router.get(
  "/business/:projectType/:subProjectType",
  getBusinessTemplateController
);
router.get("/technical/:projectType", getTechnicalTemplateController);

router.get("/:templateType", getTemplatesByTypeController);
router.get("/:templateId", getTemplateByIdController);

router.put("/:templateId", updateTemplateController);
router.delete("/:templateId", deleteTemplateController);
router.patch("/:templateId/toggle-status", toggleTemplateStatusController);

export default router;
