import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Achievement = sequelize.define(
  "Achievement",
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    issuingAuthority: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    badgeImage: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

export default Achievement;
