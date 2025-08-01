import { Router } from "express";
import {
  createTagController,
  getTagsController,
  getTagByIdController,
  deleteTagController,
  updateTagController,
  getSynonymsByTagIdController,
  createSynonymController,
  updateSynonymController,
  deleteSynonymController,
  getTagsBySlabIdController,
} from "../controllers/tags.controller.js";

const router = Router();

router.route("/").post(createTagController).get(getTagsController);

router
  .route("/:tagId")
  .get(getTagByIdController)
  .put(updateTagController)
  .delete(deleteTagController);

router.get("/:tagId/synonyms", getSynonymsByTagIdController);
router.post("/:tagId/synonyms", createSynonymController);
router.put("/:tagId/synonyms/:synonymName", updateSynonymController);
router.delete("/:tagId/synonyms/:synonymName", deleteSynonymController);

router.get("/:slabId/tags", getTagsBySlabIdController);

export default router;
