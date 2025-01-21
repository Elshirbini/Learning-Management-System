import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export const Cart = sequelize.define(
  "carts",
  {
    cart_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      get() {
        const value = this.getDataValue("totalCost");
        return value ? +value : null;
      },
      defaultValue: 0.0,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  { timestamps: true }
);

export const CartItems = sequelize.define("cart_items", {
  item_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  course_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    get() {
      const value = this.getDataValue("price");
      return value ? +value : null;
    },
    allowNull: false,
  },
  cart_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});
