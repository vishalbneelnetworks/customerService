import { Router } from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  updateAddons,
} from "../controllers/service.controller.js";

const router = Router();

router.route("/").post(createService).get(getAllServices);
router
  .route("/:id")
  .get(getServiceById)
  .put(updateService)
  .delete(deleteService);
router.route("/:id/addons").put(updateAddons);

export default router;
