import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = Router();

router.post(
  "/register",
  protect,
  [
    body("name", "Name is required").notEmpty(),
    body("email", "Valid email is required").isEmail(),
    body("password", "Password must be 6+ characters").isLength({ min: 6 }),
  ],
  validate,
  register,
);

router.post(
  "/login",
  [
    body("email", "Valid email is required").isEmail(),
    body("password", "Password is required").notEmpty(),
  ],
  validate,
  login,
);

router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

router.post(
  "/forgot-password",
  [body("email").isEmail()],
  validate,
  forgotPassword,
);

router.put(
  "/reset-password/:token",
  [body("newPassword").isLength({ min: 6 })],
  validate,
  resetPassword,
);

export default router;
