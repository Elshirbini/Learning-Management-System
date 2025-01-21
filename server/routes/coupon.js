import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { restrictTo } from "../middlewares/restricting.js";
import {
  createCoupon,
  deleteCoupon,
  getCoupon,
  updateCoupon,
} from "../controllers/coupon.js";

const router = express.Router();

router.get("/get-coupon/:couponId", verifyToken, getCoupon);

router.post(
  "/create-coupon",
  verifyToken,
  restrictTo("admin", "instructor"),
  createCoupon
);

router.put(
  "/update-coupon/:couponId",
  verifyToken,
  restrictTo("admin", "instructor"),
  updateCoupon
);

router.delete(
  "/delete-coupon/:couponId",
  verifyToken,
  restrictTo("admin", "instructor"),
  deleteCoupon
);

export const couponRoutes = router;
