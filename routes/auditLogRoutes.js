import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getAuditLogs } from "../controllers/auditLogController.js";

const router = Router();
router.get("/", protect, getAuditLogs);

export default router;
