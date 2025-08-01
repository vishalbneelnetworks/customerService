import { Router } from "express";
import {
  getFormDataController,
  getFormScoreController,
} from "../controllers/score.controller.js";

const router = Router();

router.get("/form-data/:formId", getFormDataController);
router.get("/form-score/:formId", getFormScoreController);

export default router;
