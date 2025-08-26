import { serviceRouter, subServiceRouter } from "./offerings.route.js";
import { Router } from "express";

const router = Router();

router.use("/services", serviceRouter);
router.use("/sub-services", subServiceRouter);

export default router;
