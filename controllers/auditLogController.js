import { Op } from "sequelize";
import AuditLog from "../models/AuditLog.js";
import Admin from "../models/Admin.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

const mapLog = (log) => {
  if (!log) return null;
  const data = log.toJSON ? log.toJSON() : log;
  const formatted = { ...data, _id: data.id };
  if (formatted.admin && typeof formatted.admin === "object") {
    formatted.adminId = {
      ...formatted.admin,
      _id: formatted.admin.id,
    };
    delete formatted.admin;
  }
  return formatted;
};

export const getAuditLogs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.search) {
    filter[Op.or] = [
      { action: { [Op.like]: `%${req.query.search}%` } },
      { resource: { [Op.like]: `%${req.query.search}%` } },
    ];
  }

  const logs = await AuditLog.findAll({
    where: filter,
    include: [
      {
        model: Admin,
        as: "admin",
        attributes: ["name", "email"],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: 100,
  });

  const formatted = logs.map(mapLog);
  res.json(new ApiResponse(200, formatted, "Audit logs fetched"));
});
