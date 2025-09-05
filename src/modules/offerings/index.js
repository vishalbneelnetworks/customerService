import { serviceRouter, subServiceRouter } from "./offerings.route.js";
import { Router } from "express";
import { verifyJWT } from "../../shared/middlewares/auth.middleware.js";

const router = Router();

router.use("/services", verifyJWT, serviceRouter);
router.use("/sub-services", subServiceRouter);

export default router;
