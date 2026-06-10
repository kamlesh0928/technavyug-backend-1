import AuditLog from "../models/AuditLog.js";

const logAction = async (
  adminId,
  action,
  resource,
  resourceId = null,
  details = {},
) => {
  try {
    await AuditLog.create({ adminId, action, resource, resourceId, details });
  } catch (err) {
    console.error("Audit log write failed:", err.message);
  }
};

export { logAction };
