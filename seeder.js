import "dotenv/config";
import Admin from "./models/Admin.js";
import connectDB from "./config/db.js";

const seedAdmin = async () => {
  // Setup MySQL connection and sync tables
  await connectDB();

  const existing = await Admin.findOne({ where: { email: "admin@gmail.com" } });
  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }

  await Admin.create({
    name: "Admin",
    email: "admin@gmail.com",
    password: "123456",
    role: "superadmin",
  });

  console.log("Admin seeded: admin@gmail.com / 123456");
  process.exit(0);
};

seedAdmin();
