import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import Admin from "../models/Admin.js";

const protect = asyncHandler(async (req, _res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) throw new ApiError(401, "Not authorised, no token provided");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const admin = await Admin.findByPk(decoded.id);
  if (!admin) throw new ApiError(401, "Not authorised, admin not found");

  req.admin = admin;
  next();
});

const optionalAuth = asyncHandler(async (req, _res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await Admin.findByPk(decoded.id);
    } catch (_e) {
      /* token invalid on public route, continue without admin */
    }
  }
  next();
});

const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return next(
        new ApiError(
          403,
          `Role "${req.admin?.role || "unknown"}" is not authorised`,
        ),
      );
    }
    next();
  };

export { protect, optionalAuth, authorize };
