import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export const Course = sequelize.define(
  "courses",
  {
    course_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      get() {
        const value = this.getDataValue("price");
        return value ? +value : null;
      },
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.JSON,
    },
    category: {
      type: DataTypes.ENUM("Web", "Mobile", "Security", "Database", "Cloud"),
      allowNull: false,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "English",
    },
  },
  { timestamps: true }
);
