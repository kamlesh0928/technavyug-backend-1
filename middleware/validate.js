import { validationResult } from "express-validator";
import ApiError from "../utils/apiError.js";

const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extracted = errors.array().map((e) => ({ [e.path]: e.msg }));
    throw new ApiError(422, "Validation failed", extracted);
  }
  next();
};

export { validate };
