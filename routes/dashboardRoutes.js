import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getDashboardStats } from "../controllers/dashboardController.js";

const router = Router();
router.get("/", protect, getDashboardStats);

export default router;
