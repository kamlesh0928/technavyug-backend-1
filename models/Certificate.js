import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";

const Certificate = sequelize.define(
  "Certificate",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    certificateTitle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    issuingOrganization: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    issueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    certificateId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    verificationUrl: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    certificateFile: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    qrCode: {
      type: DataTypes.TEXT("long"),
      defaultValue: "",
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
  }
);

Certificate.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});
export default Certificate;
