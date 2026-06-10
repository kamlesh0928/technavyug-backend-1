import { Op } from "sequelize";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { logAction } from "../utils/auditLogger.js";

const mapUser = (user) => {
  if (!user) return null;
  const data = user.toJSON ? user.toJSON() : user;
  return { ...data, _id: data.id };
};

export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.search) {
    filter[Op.or] = [
      { fullName: { [Op.like]: `%${req.query.search}%` } },
      { email: { [Op.like]: `%${req.query.search}%` } },
      { designation: { [Op.like]: `%${req.query.search}%` } },
    ];
  }

  const { count: total, rows: users } = await User.findAndCountAll({
    where: filter,
    order: [["createdAt", "DESC"]],
    offset: skip,
    limit: limit,
  });

  const formatted = users.map(mapUser);

  res.json(
    new ApiResponse(
      200,
      {
        users: formatted,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      "Users fetched",
    ),
  );
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  res.json(new ApiResponse(200, mapUser(user), "User fetched"));
});

export const createUser = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.profilePhoto = req.file.path;
  if (typeof data.skills === "string") data.skills = JSON.parse(data.skills);
  if (typeof data.socialLinks === "string")
    data.socialLinks = JSON.parse(data.socialLinks);

  const user = await User.create(data);
  await logAction(req.admin.id, "CREATE", "User", user.id, {
    fullName: user.fullName,
  });
  res.status(201).json(new ApiResponse(201, mapUser(user), "User created"));
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  const data = { ...req.body };
  if (req.file) data.profilePhoto = req.file.path;
  if (typeof data.skills === "string") data.skills = JSON.parse(data.skills);
  if (typeof data.socialLinks === "string")
    data.socialLinks = JSON.parse(data.socialLinks);

  await user.update(data);
  await logAction(req.admin.id, "UPDATE", "User", user.id, {
    fullName: user.fullName,
  });
  res.json(new ApiResponse(200, mapUser(user), "User updated"));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  await user.destroy();
  await logAction(req.admin.id, "DELETE", "User", user.id, {
    fullName: user.fullName,
  });
  res.json(new ApiResponse(200, {}, "User deleted"));
});
