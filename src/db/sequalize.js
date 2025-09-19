import { Sequelize } from "sequelize";
import env from "../config/index.js";

const sequelize = new Sequelize(
  env.mysql.database,
  env.mysql.username,
  env.mysql.password,
  {
    host: env.mysql.host,
    port: env.mysql.port,
    dialect: env.mysql.dialect,
    logging: env.nodeEnv === "development" ? console.log : false,
  }
);

export const initSqlDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("✔️ Database connection successful!");

    if (env.nodeEnv === "production") {
      await sequelize.sync({ force: false });
      console.log("✔️ Tables synchronized successfully!");
    } else {
      console.log("🔧 Development mode - skipping schema sync");
    }
  } catch (error) {
    console.log("❌ MySQL db connection failed: ", error);
    if (env.nodeEnv === "production") {
      process.exit(1);
    } else {
      console.log("⚠️ Continuing in development mode...");
    }
  }
};

export const closeSqlDatabase = async () => {
  try {
    await sequelize.close();
    console.log("✔️ Database connection closed!");
  } catch (error) {
    console.log("❌ Error closing database connection: ", error);
  }
};

export default sequelize;
