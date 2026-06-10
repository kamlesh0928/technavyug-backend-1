import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  getAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from "../controllers/achievementController.js";

const router = Router();

const rules = [
  body("title", "Title is required").notEmpty(),
  body("type", "Type is required").notEmpty(),
  body("description", "Description is required").notEmpty(),
  body("issuingAuthority", "Issuing Authority is required").notEmpty(),
];

router
  .route("/")
  .get(getAchievements)
  .post(
    protect,
    upload.single("badgeImage"),
    rules,
    validate,
    createAchievement,
  );

router
  .route("/:id")
  .get(getAchievement)
  .put(protect, upload.single("badgeImage"), updateAchievement)
  .delete(protect, deleteAchievement);

export default router;
