import { Op } from "sequelize";
import Achievement from "../models/Achievement.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { logAction } from "../utils/auditLogger.js";

const mapItem = (item) => {
  if (!item) return null;
  const data = item.toJSON ? item.toJSON() : item;
  return { ...data, _id: data.id };
};

export const getAchievements = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.featured) filter.featured = req.query.featured === "true";
  if (req.query.search) {
    filter.title = { [Op.like]: `%${req.query.search}%` };
  }
  if (req.query.type) filter.type = req.query.type;

  const achievements = await Achievement.findAll({
    where: filter,
    order: [["createdAt", "DESC"]],
  });
  
  const formatted = achievements.map(mapItem);
  res.json(new ApiResponse(200, formatted, "Achievements fetched"));
});

export const getAchievement = asyncHandler(async (req, res) => {
  const item = await Achievement.findByPk(req.params.id);
  if (!item) throw new ApiError(404, "Achievement not found");
  res.json(new ApiResponse(200, mapItem(item), "Achievement fetched"));
});

export const createAchievement = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.badgeImage = req.file.path;
  const item = await Achievement.create(data);
  await logAction(req.admin.id, "CREATE", "Achievement", item.id, {
    title: item.title,
  });
  res.status(201).json(new ApiResponse(201, mapItem(item), "Achievement created"));
});

export const updateAchievement = asyncHandler(async (req, res) => {
  const item = await Achievement.findByPk(req.params.id);
  if (!item) throw new ApiError(404, "Achievement not found");
  const data = { ...req.body };
  if (req.file) data.badgeImage = req.file.path;
  
  await item.update(data);
  await logAction(req.admin.id, "UPDATE", "Achievement", item.id, {
    title: item.title,
  });
  res.json(new ApiResponse(200, mapItem(item), "Achievement updated"));
});

export const deleteAchievement = asyncHandler(async (req, res) => {
  const item = await Achievement.findByPk(req.params.id);
  if (!item) throw new ApiError(404, "Achievement not found");
  await item.destroy();
  await logAction(req.admin.id, "DELETE", "Achievement", item.id, {
    title: item.title,
  });
  res.json(new ApiResponse(200, {}, "Achievement deleted"));
});
