import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { ApiError } from "../utils/apiError.js";

export const User = sequelize.define(
  "users",
  {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    googleId: {
      type: DataTypes.STRING,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        is: {
          args: [/^\d{11,15}$/],
          msg: "Please enter a valid phone number (11-15 digits)",
        },
      },
    },
    image: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM("admin", "instructor", "student"),
      defaultValue: "student",
    },
    codeValidation: {
      type: DataTypes.STRING,
    },
    codeValidationExpire: {
      type: DataTypes.DATE,
    },
  },
  {
    hooks: {
      beforeSave: (user, option) => {
        if (!user.googleId && !user.password) {
          throw new ApiError("Please provide password", 401);
        }
      },
    },
    timestamps: true,
  }
);
