import { Op } from "sequelize";
import Project from "../models/Project.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { logAction } from "../utils/auditLogger.js";

const parseJsonField = (val) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val;
  } catch {
    return val;
  }
};

const mapProject = (project) => {
  if (!project) return null;
  const data = project.toJSON ? project.toJSON() : project;
  const formatted = { ...data, _id: data.id };
  if (formatted.teamMembers && Array.isArray(formatted.teamMembers)) {
    formatted.teamMembers = formatted.teamMembers.map((member) => ({
      ...member,
      _id: member.id,
    }));
  }
  return formatted;
};

export const getProjects = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.search) {
    filter.title = { [Op.like]: `%${req.query.search}%` };
  }
  if (req.query.category) filter.category = req.query.category;
  if (req.query.featured) filter.featured = req.query.featured === "true";
  if (req.query.status) filter.status = req.query.status;

  if (!req.admin) {
    filter.visibility = "Public";
    filter.published = true;
  }

  let order = [["createdAt", "DESC"]];
  const sort = req.query.sort;
  if (sort) {
    if (sort.startsWith("-")) {
      order = [[sort.substring(1), "DESC"]];
    } else {
      order = [[sort, "ASC"]];
    }
  }

  const { count: total, rows: projects } = await Project.findAndCountAll({
    where: filter,
    include: [
      {
        model: User,
        as: "teamMembers",
        attributes: ["fullName", "profilePhoto"],
        through: { attributes: [] },
      },
    ],
    order: order,
    offset: skip,
    limit: limit,
  });

  const formatted = projects.map(mapProject);

  res.json(
    new ApiResponse(
      200,
      {
        projects: formatted,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      "Projects fetched",
    ),
  );
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: "teamMembers",
        attributes: ["fullName", "profilePhoto", "designation"],
        through: { attributes: [] },
      },
    ],
  });
  if (!project) throw new ApiError(404, "Project not found");
  res.json(new ApiResponse(200, mapProject(project), "Project fetched"));
});

export const createProject = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.files) {
    if (req.files.thumbnailImage)
      data.thumbnailImage = req.files.thumbnailImage[0].path;
    if (req.files.galleryImages)
      data.galleryImages = req.files.galleryImages.map((f) => f.path);
  }
  data.techStack = parseJsonField(data.techStack);
  const teamMembers = parseJsonField(data.teamMembers);
  data.demoVideoLinks = parseJsonField(data.demoVideoLinks);

  const project = await Project.create(data);
  if (teamMembers && teamMembers.length > 0) {
    await project.setTeamMembers(teamMembers);
  }

  await logAction(req.admin.id, "CREATE", "Project", project.id, {
    title: project.title,
  });

  const populated = await Project.findByPk(project.id, {
    include: [
      {
        model: User,
        as: "teamMembers",
        attributes: ["fullName", "profilePhoto"],
        through: { attributes: [] },
      },
    ],
  });

  res.status(201).json(new ApiResponse(201, mapProject(populated), "Project created"));
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) throw new ApiError(404, "Project not found");

  const data = { ...req.body };
  if (req.files) {
    if (req.files.thumbnailImage)
      data.thumbnailImage = req.files.thumbnailImage[0].path;
    if (req.files.galleryImages) {
      data.galleryImages = [
        ...project.galleryImages,
        ...req.files.galleryImages.map((f) => f.path),
      ];
    }
  }
  data.techStack = parseJsonField(data.techStack);
  const teamMembers = parseJsonField(data.teamMembers);
  data.demoVideoLinks = parseJsonField(data.demoVideoLinks);

  await project.update(data);
  if (teamMembers) {
    await project.setTeamMembers(teamMembers);
  }

  await logAction(req.admin.id, "UPDATE", "Project", project.id, {
    title: project.title,
  });

  const populated = await Project.findByPk(project.id, {
    include: [
      {
        model: User,
        as: "teamMembers",
        attributes: ["fullName", "profilePhoto"],
        through: { attributes: [] },
      },
    ],
  });

  res.json(new ApiResponse(200, mapProject(populated), "Project updated"));
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) throw new ApiError(404, "Project not found");
  
  await project.setTeamMembers([]);
  await project.destroy();

  await logAction(req.admin.id, "DELETE", "Project", project.id, {
    title: project.title,
  });
  res.json(new ApiResponse(200, {}, "Project deleted"));
});

export const duplicateProject = asyncHandler(async (req, res) => {
  const project = await Project.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: "teamMembers",
        attributes: ["id"],
        through: { attributes: [] },
      },
    ],
  });
  if (!project) throw new ApiError(404, "Project not found");

  const dup = project.toJSON();
  const teamMembers = (dup.teamMembers || []).map((m) => m.id);

  delete dup.id;
  delete dup._id;
  delete dup.createdAt;
  delete dup.updatedAt;
  delete dup.teamMembers;

  dup.title = `${dup.title} (Copy)`;
  dup.status = "Planned";

  const newProject = await Project.create(dup);
  if (teamMembers && teamMembers.length > 0) {
    await newProject.setTeamMembers(teamMembers);
  }

  await logAction(req.admin.id, "DUPLICATE", "Project", newProject.id, {
    originalId: project.id,
  });

  const populated = await Project.findByPk(newProject.id, {
    include: [
      {
        model: User,
        as: "teamMembers",
        attributes: ["fullName", "profilePhoto"],
        through: { attributes: [] },
      },
    ],
  });

  res.status(201).json(new ApiResponse(201, mapProject(populated), "Project duplicated"));
});
