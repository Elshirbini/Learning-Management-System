import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { addToCart, getCart, removeFromCart } from "../controllers/cart.js";

const router = express.Router();

router.get(
  "/get-cart",
  verifyToken,
  getCart
);

router.post(
  "/add-to-cart",
  verifyToken,
  addToCart
);

router.delete(
  "/remove-from-cart/:itemId",
  verifyToken,
  removeFromCart
);

export const cartRoutes = router;
