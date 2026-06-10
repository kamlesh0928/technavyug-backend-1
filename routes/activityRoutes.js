import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getActivity } from "../controllers/activityController.js";

const router = Router();
router.get("/", protect, getActivity);

export default router;
