import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export const Module = sequelize.define(
  "modules",
  {
    module_id: {
      type: DataTypes.UUID,
      defaultValue : DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["order", "course_id"],
      },
    ],
    timestamps: true,
  }
);
