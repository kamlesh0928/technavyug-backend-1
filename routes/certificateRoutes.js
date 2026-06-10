import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  getCertificates,
  getCertificate,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  verifyCertificate,
} from "../controllers/certificateController.js";

const router = Router();

const rules = [
  body("certificateTitle", "Title is required").notEmpty(),
  body("issuingOrganization", "Organization is required").notEmpty(),
  body("issueDate", "Issue date is required").notEmpty(),
];

router.get("/verify/:certificateId", verifyCertificate);

router
  .route("/")
  .get(protect, getCertificates)
  .post(
    protect,
    upload.single("certificateFile"),
    rules,
    validate,
    createCertificate,
  );

router
  .route("/:id")
  .get(protect, getCertificate)
  .put(protect, upload.single("certificateFile"), updateCertificate)
  .delete(protect, deleteCertificate);

export default router;
