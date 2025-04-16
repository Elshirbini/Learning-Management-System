import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export const Coupon = sequelize.define(
  "coupons",
  {
    coupon_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    discount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  { indexes: [{ fields: ["coupon_id"] }], timestamps: true }
);
