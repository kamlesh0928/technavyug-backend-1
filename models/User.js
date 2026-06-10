import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profilePhoto: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    linkedinUrl: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    bio: {
      type: DataTypes.TEXT,
      defaultValue: "",
    },
    skills: {
      type: DataTypes.TEXT,
      defaultValue: "[]",
      get() {
        const rawValue = this.getDataValue("skills");
        try {
          return rawValue ? JSON.parse(rawValue) : [];
        } catch {
          return [];
        }
      },
      set(value) {
        this.setDataValue("skills", JSON.stringify(value || []));
      },
    },
    socialLinks: {
      type: DataTypes.TEXT,
      defaultValue: JSON.stringify({ github: "", twitter: "", portfolio: "" }),
      get() {
        const rawValue = this.getDataValue("socialLinks");
        try {
          return rawValue ? JSON.parse(rawValue) : { github: "", twitter: "", portfolio: "" };
        } catch {
          return { github: "", twitter: "", portfolio: "" };
        }
      },
      set(value) {
        this.setDataValue("socialLinks", JSON.stringify(value || { github: "", twitter: "", portfolio: "" }));
      },
    },
  },
  {
    timestamps: true,
  }
);

export default User;
