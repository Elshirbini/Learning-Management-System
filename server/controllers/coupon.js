import { ApiError } from "../utils/apiError.js";
import { Coupon } from "../models/coupon.js";
import couponCode from "coupon-code";

export const getCoupon = async (req, res, next) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findByPk(couponId);

  if (!coupon) throw new ApiError("No coupons found", 404);

  res.status(200).json(coupon);
};

export const createCoupon = async (req, res, next) => {
  const { discount, expires } = req.body;

  const date = Date.now();

  if (!discount || new Date(expires).getTime() <= date) {
    throw new ApiError("discount and expire date should be valid", 400);
  }

  const code = couponCode.generate({ parts: 2, partLen: 4 });

  const coupon = await Coupon.create({ code, discount, expires });

  res.status(201).json({ message: "Coupon created successfully", coupon });
};

export const updateCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const { discount, expires } = req.body;

  const date = Date.now();

  if (!discount || new Date(expires).getTime() <= date) {
    throw new ApiError("discount and expire date should be valid", 400);
  }

  const code = couponCode.generate({ parts: 2, partLen: 4 });

  const [numberOfUpdates, updateCoupon] = await Coupon.update(
    { code, discount, expires },
    { where: { coupon_id: couponId }, returning: true }
  );
  if (!updateCoupon || updateCoupon.length === 0) {
    throw new ApiError("No coupons found", 404);
  }

  res
    .status(200)
    .json({ message: "Coupon updated successfully", updateCoupon });
};

export const deleteCoupon = async (req, res, next) => {
  const { couponId } = req.params;

  const coupon = await Coupon.findOne({ where: { coupon_id: couponId } });

  if (!coupon) throw new ApiError("No coupons found", 404);

  await coupon.destroy();

  res.status(200).json({ message: "Coupon deleted successfully" });
};
