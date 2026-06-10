import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || "database_not_set",
  process.env.DB_USER || "user_not_set",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: "mysql",
    logging: false,
  },
);

export let dbStatus = {
  connected: false,
  error: null,
};

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL Database Connected successfully via Sequelize");
    dbStatus.connected = true;

    // Sync models
    await sequelize.sync({ alter: true });
    console.log("Database models synchronized");
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    dbStatus.error = error.message;
  }
};

export { sequelize };
export default connectDB;
