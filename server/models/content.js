import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export const Content = sequelize.define(
  "contents",
  {
    content_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.ENUM("video", "pdf"),
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    module_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["order", "module_id"],
      },
    ],
    timestamps: true,
  }
);