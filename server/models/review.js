import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export const Review = sequelize.define(
  "reviews",
  {
    review_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["user_id", "course_id"],
      },
    ],
  }
);
