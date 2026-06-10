import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";

const Project = sequelize.define(
  "Project",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shortDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fullDescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Completed", "Ongoing", "Planned"),
      defaultValue: "Completed",
    },
    thumbnailImage: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    galleryImages: {
      type: DataTypes.TEXT,
      defaultValue: "[]",
      get() {
        const rawValue = this.getDataValue("galleryImages");
        try {
          return rawValue ? JSON.parse(rawValue) : [];
        } catch {
          return [];
        }
      },
      set(value) {
        this.setDataValue("galleryImages", JSON.stringify(value || []));
      },
    },
    demoVideoLinks: {
      type: DataTypes.TEXT,
      defaultValue: "[]",
      get() {
        const rawValue = this.getDataValue("demoVideoLinks");
        try {
          return rawValue ? JSON.parse(rawValue) : [];
        } catch {
          return [];
        }
      },
      set(value) {
        this.setDataValue("demoVideoLinks", JSON.stringify(value || []));
      },
    },
    liveProjectUrl: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    visibility: {
      type: DataTypes.ENUM("Public", "Private"),
      defaultValue: "Public",
    },
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    techStack: {
      type: DataTypes.TEXT,
      defaultValue: "[]",
      get() {
        const rawValue = this.getDataValue("techStack");
        try {
          return rawValue ? JSON.parse(rawValue) : [];
        } catch {
          return [];
        }
      },
      set(value) {
        this.setDataValue("techStack", JSON.stringify(value || []));
      },
    },
  },
  {
    timestamps: true,
  }
);

// Association
Project.belongsToMany(User, {
  through: "ProjectTeamMembers",
  as: "teamMembers",
  foreignKey: "projectId",
  otherKey: "userId",
});
User.belongsToMany(Project, {
  through: "ProjectTeamMembers",
  as: "projects",
  foreignKey: "userId",
  otherKey: "projectId",
});

export default Project;
