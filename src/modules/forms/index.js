import { Router } from "express";
import formRoutes from "./form.route.js";

const router = Router();

router.use("/forms", formRoutes);

console.log(`✅ Forms module loaded`);
export default router;
