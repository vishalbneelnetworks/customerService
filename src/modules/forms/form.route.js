import { Router } from "express";
import {
  createFormController,
  getFormsController,
  getFormByIdController,
  updateFormController,
  deleteFormController,
  changeFormStatusController,
  submitFormController,
} from "./form.controller.js";

const router = Router();

router.get("/", getFormsController);
router.get("/:formId", getFormByIdController);

router.post("/", createFormController);
router.patch("/:formId", updateFormController);
router.delete("/:formId", deleteFormController);
router.patch("/:formId/status", changeFormStatusController);
router.patch("/:formId/submit", submitFormController);

export default router;
