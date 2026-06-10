import User from "../models/User.js";
import Project from "../models/Project.js";
import Certificate from "../models/Certificate.js";
import Achievement from "../models/Achievement.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";

export const getAnalytics = asyncHandler(async (_req, res) => {
  const [totalUsers, totalProjects, totalCertificates, totalAchievements] =
    await Promise.all([
      User.count(),
      Project.count(),
      Certificate.count(),
      Achievement.count(),
    ]);

  res.json(
    new ApiResponse(
      200,
      {
        totalUsers,
        totalProjects,
        totalCertificates,
        totalAchievements,
      },
      "Analytics fetched",
    ),
  );
});
