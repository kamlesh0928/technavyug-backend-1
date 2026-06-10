import "dotenv/config";
import connectDB from "./config/db.js";
import Certificate from "./models/Certificate.js";
import User from "./models/User.js";
import AuditLog from "./models/AuditLog.js";
import Admin from "./models/Admin.js";

async function run() {
  await connectDB();
  console.log("Database connected. Testing queries...");

  try {
    const certs = await Certificate.findAll({
      include: [{ model: User, as: "user", attributes: ["fullName", "email"] }],
    });
    console.log(`SUCCESS: Queried ${certs.length} certificates with 'user' include.`);
    if (certs.length > 0) {
      const mapped = certs[0].toJSON();
      console.log("Sample cert keys:", Object.keys(mapped));
      console.log("Sample cert.user:", mapped.user);
    }
  } catch (err) {
    console.error("Certificate query FAILED:", err.message);
  }

  try {
    const logs = await AuditLog.findAll({
      include: [{ model: Admin, as: "admin", attributes: ["name", "email"] }],
    });
    console.log(`SUCCESS: Queried ${logs.length} audit logs with 'admin' include.`);
  } catch (err) {
    console.error("AuditLog query FAILED:", err.message);
  }

  process.exit(0);
}

run();
