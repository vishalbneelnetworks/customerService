import { Router } from "express";
import {
  createSlabController,
  getSlabsController,
  getSlabByIdController,
  updateSlabController,
  deleteSlabController,
  getTagsBySlabIdController,
} from "../controllers/slab.controller.js";

const router = Router();

router.route("/").post(createSlabController).get(getSlabsController);
router
  .route("/:slabId")
  .get(getSlabByIdController)
  .put(updateSlabController)
  .delete(deleteSlabController);

router.get("/:slabId/tags", getTagsBySlabIdController);

export default router;
