import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { addToCart, getCart, removeFromCart } from "../controllers/cart.js";
import { restrictTo } from "../middlewares/restricting.js";

const router = express.Router();

router.get(
  "/get-cart",
  verifyToken,
  restrictTo("admin", "instructor", "student"),
  getCart
);

router.post(
  "/add-to-cart",
  verifyToken,
  restrictTo("admin", "instructor", "student"),
  addToCart
);

router.delete(
  "/remove-from-cart/:itemId",
  verifyToken,
  restrictTo("admin", "instructor", "student"),
  removeFromCart
);

export const cartRoutes = router;
