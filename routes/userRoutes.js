import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = Router();

const userRules = [
  body("fullName", "Full name is required").notEmpty(),
  body("email", "Valid email is required").isEmail(),
  body("designation", "Designation is required").notEmpty(),
];

router
  .route("/")
  .get(getUsers)
  .post(protect, upload.single("profilePhoto"), userRules, validate, createUser);

router
  .route("/:id")
  .get(getUser)
  .put(protect, upload.single("profilePhoto"), updateUser)
  .delete(protect, deleteUser);

export default router;
