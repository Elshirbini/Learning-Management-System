import { Sequelize } from "sequelize";
import asyncHandler from "express-async-handler";
import { configDotenv } from "dotenv";
configDotenv();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    logging: false,
  }
);
asyncHandler(async () => {
  await sequelize.authenticate();
  console.log("Connected to PostgreSQL successfully.");
})();

export default sequelize;
