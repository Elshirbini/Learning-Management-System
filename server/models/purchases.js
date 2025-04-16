import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export const Purchase = sequelize.define(
  "purchases",
  {
    purchase_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    course_id: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      get() {
        const value = this.getDataValue("amount");
        return value ? +value : null;
      },
      allowNull: false,
    },
    purchasesAt: {
      type: DataTypes.DATE,
      defaultValue: Date.now(),
    },
  },
  { indexes: [{ fields: ["user_id"] }] }
);
