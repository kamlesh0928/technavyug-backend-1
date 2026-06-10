import crypto from "crypto";
import { Op } from "sequelize";
import Admin from "../models/Admin.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { logAction } from "../utils/auditLogger.js";

const sendTokenResponse = (admin, statusCode, res) => {
  const token = admin.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    data: {
      _id: admin.id, // Kept as _id to preserve frontend structure compatibility
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (await Admin.findOne({ where: { email } })) {
    throw new ApiError(400, "Admin with this email already exists");
  }

  const admin = await Admin.create({ name, email, password, role });
  await logAction(admin.id, "REGISTER", "Admin", admin.id, { email });
  sendTokenResponse(admin, 201, res);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const admin = await Admin.scope("withPassword").findOne({ where: { email } });
  if (!admin) throw new ApiError(401, "Invalid credentials");

  const isMatch = await admin.matchPassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  await logAction(admin.id, "LOGIN", "Admin", admin.id, { email });
  sendTokenResponse(admin, 200, res);
});

export const getMe = asyncHandler(async (req, res) => {
  // Map id to _id for response payload to keep frontend perfectly intact
  const userPayload = {
    _id: req.admin.id,
    name: req.admin.name,
    email: req.admin.email,
    role: req.admin.role,
    createdAt: req.admin.createdAt,
    updatedAt: req.admin.updatedAt,
  };
  res.status(200).json(new ApiResponse(200, userPayload, "Admin fetched"));
});

export const logout = asyncHandler(async (_req, res) => {
  res.status(200).json(new ApiResponse(200, {}, "Logged out"));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ where: { email } });
  if (!admin) throw new ApiError(404, "No account with that email");

  const resetToken = admin.getResetPasswordToken();
  await admin.save();

  await logAction(admin.id, "FORGOT_PASSWORD", "Admin", admin.id, { email });
  res
    .status(200)
    .json(
      new ApiResponse(200, { resetToken }, "Password reset token generated"),
    );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  if (!newPassword) {
    throw new ApiError(400, "New password is required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const admin = await Admin.scope("withPassword").findOne({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { [Op.gt]: new Date() },
    },
  });

  if (!admin) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  admin.password = newPassword;
  admin.resetPasswordToken = null;
  admin.resetPasswordExpire = null;
  await admin.save();

  await logAction(admin.id, "RESET_PASSWORD", "Admin", admin.id, {
    email: admin.email,
  });
  sendTokenResponse(admin, 200, res);
});
