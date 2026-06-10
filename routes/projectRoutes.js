import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import { protect, optionalAuth } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  duplicateProject,
} from "../controllers/projectController.js";

const router = Router();

const rules = [
  body("title", "Title is required").notEmpty(),
  body("category", "Category is required").notEmpty(),
  body("shortDescription", "Short description is required").notEmpty(),
  body("fullDescription", "Full description is required").notEmpty(),
];

const projectUpload = upload.fields([
  { name: "thumbnailImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 10 },
]);

router
  .route("/")
  .get(optionalAuth, getProjects)
  .post(protect, projectUpload, rules, validate, createProject);

router
  .route("/:id")
  .get(getProject)
  .put(protect, projectUpload, updateProject)
  .delete(protect, deleteProject);

router.post("/:id/duplicate", protect, duplicateProject);

export default router;
