import AuditLog from "../models/AuditLog.js";
import Admin from "../models/Admin.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

export const getActivity = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const { count, rows } = await AuditLog.findAndCountAll({
    order: [["createdAt", "DESC"]],
    limit,
    offset,
    include: [
      {
        model: Admin,
        as: "admin",
        attributes: ["name", "email"],
      },
    ],
  });

  const activities = rows.map((log) => {
    const plain = log.get({ plain: true });
    return {
      id: plain.id,
      title: `${plain.action} ${plain.resource}`,
      timestamp: plain.createdAt,
      type: plain.action.toLowerCase(),
      resource: plain.resource,
      resourceId: plain.resourceId,
      details: plain.details,
      admin: plain.admin ? plain.admin.name : "System",
    };
  });

  const hasMore = offset + rows.length < count;

  res.json(
    new ApiResponse(
      200,
      {
        activities,
        hasMore,
        page,
        total: count,
      },
      "Activity fetched",
    ),
  );
});
