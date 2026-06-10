import User from "../models/User.js";
import Project from "../models/Project.js";
import Certificate from "../models/Certificate.js";
import Achievement from "../models/Achievement.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import { sequelize } from "../config/db.js";

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const [
    totalUsers,
    totalProjects,
    totalCertificates,
    totalAchievements,
    featuredProjects,
    publicProjects,
  ] = await Promise.all([
    User.count(),
    Project.count(),
    Certificate.count(),
    Achievement.count(),
    Project.count({ where: { featured: true } }),
    Project.count({ where: { visibility: "Public" } }),
  ]);

  const achievementsByDomainRaw = await Achievement.findAll({
    attributes: [
      ["type", "_id"],
      [sequelize.fn("COUNT", sequelize.col("type")), "count"],
    ],
    group: ["type"],
  });

  const achievementsByDomain = achievementsByDomainRaw.map((r) => {
    const raw = r.get({ plain: true });
    return {
      _id: raw._id,
      count: parseInt(raw.count, 10) || 0,
    };
  });

  const certificatesPerMonthRaw = await Certificate.findAll({
    attributes: [
      [sequelize.fn("MONTH", sequelize.col("issueDate")), "_id"],
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    group: [sequelize.fn("MONTH", sequelize.col("issueDate"))],
    order: [[sequelize.literal("_id"), "ASC"]],
  });

  const certificatesPerMonth = certificatesPerMonthRaw.map((r) => {
    const raw = r.get({ plain: true });
    return {
      _id: raw._id,
      count: parseInt(raw.count, 10) || 0,
    };
  });

  const userGrowthRaw = await User.findAll({
    attributes: [
      [sequelize.fn("MONTH", sequelize.col("createdAt")), "_id"],
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    group: [sequelize.fn("MONTH", sequelize.col("createdAt"))],
    order: [[sequelize.literal("_id"), "ASC"]],
  });

  const userGrowth = userGrowthRaw.map((r) => {
    const raw = r.get({ plain: true });
    return {
      _id: raw._id,
      count: parseInt(raw.count, 10) || 0,
    };
  });

  const recentUsers = await User.findAll({
    attributes: ["fullName", "createdAt"],
    order: [["createdAt", "DESC"]],
    limit: 2,
  });

  const recentProjects = await Project.findAll({
    attributes: ["title", "createdAt"],
    order: [["createdAt", "DESC"]],
    limit: 2,
  });

  const recentCertificates = await Certificate.findAll({
    attributes: ["certificateTitle", "createdAt"],
    order: [["createdAt", "DESC"]],
    limit: 2,
  });

  const recentAchievements = await Achievement.findAll({
    attributes: ["title", "createdAt"],
    order: [["createdAt", "DESC"]],
    limit: 2,
  });

  const recentUploads = [
    ...recentUsers.map((u) => ({
      type: "user",
      text: `${u.fullName} registered`,
      time: u.createdAt,
    })),

    ...recentProjects.map((p) => ({
      type: "project",
      text: `${p.title} uploaded`,
      time: p.createdAt,
    })),

    ...recentCertificates.map((c) => ({
      type: "certificate",
      text: `${c.certificateTitle} certificate generated`,
      time: c.createdAt,
    })),

    ...recentAchievements.map((a) => ({
      type: "achievement",
      text: `${a.title} achievement added`,
      time: a.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 6);

  const overview = [
    {
      label: "Users Active",
      value: totalUsers
        ? Math.min(Math.round((totalUsers / 100) * 100), 100)
        : 0,
      color: "#8b5cf6",
    },

    {
      label: "Projects Done",
      value: totalProjects
        ? Math.min(Math.round((totalProjects / 100) * 100), 100)
        : 0,
      color: "#34d399",
    },

    {
      label: "Certificates Issued",
      value: totalCertificates
        ? Math.min(Math.round((totalCertificates / 100) * 100), 100)
        : 0,
      color: "#f472b6",
    },
  ];

  res.json(
    new ApiResponse(
      200,
      {
        cards: {
          totalUsers,
          totalProjects,
          totalCertificates,
          totalAchievements,
          featuredProjects,
          publicProjects,
        },

        charts: {
          achievementsByDomain,
          certificatesPerMonth,
          userGrowth,
        },

        recentUploads,
        overview,
      },

      "Dashboard stats fetched",
    ),
  );
});