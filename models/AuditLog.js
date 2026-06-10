import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Admin from "./Admin.js";

const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resourceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    details: {
      type: DataTypes.TEXT,
      defaultValue: "{}",
      get() {
        const rawValue = this.getDataValue("details");
        try {
          return rawValue ? JSON.parse(rawValue) : {};
        } catch {
          return {};
        }
      },
      set(value) {
        this.setDataValue("details", JSON.stringify(value || {}));
      },
    },
  },
  {
    timestamps: true,
  }
);

AuditLog.belongsTo(Admin, { foreignKey: "adminId", as: "admin" });

export default AuditLog;
