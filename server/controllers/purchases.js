import asyncHandler from "express-async-handler";
import { ApiError } from "../utils/apiError.js";
import { Cart, CartItems, User } from "../models/index.js";
import Stripe from "stripe";
import { Coupon } from "../models/coupon.js";
import { Op } from "sequelize";
import { Purchase } from "../models/purchases.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getPurchases = asyncHandler(async (req, res, next) => {
  const purchases = await Purchase.findAll();
  res.status(200).json({ purchases });
});

export const checkoutSession = asyncHandler(async (req, res, next) => {
  const { user } = req.user;
  const { couponCode } = req.body;
  let totalCost;

  if (!user) throw new ApiError("No user found", 404);

  const cart = await Cart.findOne({ where: { user_id: user.user_id } });
  if (!cart) throw new ApiError("No carts found", 404);

  if (couponCode) {
    const coupon = await Coupon.findOne({
      where: { code: couponCode, expires: { [Op.gt]: Date.now() } },
    });

    if (!coupon) throw new ApiError("No coupons found", 404);

    totalCost = (coupon.discount / 100) * cart.totalCost;
  } else {
    totalCost = cart.totalCost;
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "egp",
          unit_amount: totalCost * 100,
          product_data: {
            name: user.name,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/cart`,
    customer_email: user.email,
    client_reference_id: cart.cart_id,
  });

  if (!session) {
    throw new ApiError("Error occurred when sending your data", 400);
  }

  res.status(201).json({ message: "session Created successfully", session });
});

const makePurchase = asyncHandler(async (session) => {
  const email = session.customer_email;
  const cartId = session.client_reference_id;
  const totalCost = session.amount_total / 100;

  const user = await User.findOne({ where: { email: email } });
  if (!user) throw new ApiError("No users found", 404);

  const cart = await Cart.findOne({ where: { cart_id: cartId } });
  if (!cart) throw new ApiError("No carts found", 404);

  const cartItems = await CartItems.findAll({
    where: { cart_id: cartId },
    attributes: ["course_id"],
  });

  if (!cartItems || cartItems.length === 0) {
    throw new ApiError("No items in cart", 403);
  }

  const itemsId = cartItems.map((item) => item.course_id);

  const purchase = await Purchase.create({
    user_id: user.user_id,
    course_id: itemsId,
    amount: totalCost,
  });

  if (!purchase) throw new ApiError("Error occurred", 404);

  sendToEmail(
    email,
    "Payment Confirmation",
    `Dear ${user.name},\n\nYour payment of $${totalCost} for the/s course/s (ID: ${itemsId}) has been successfully processed.\n\nThank you for choosing our platform!`
  );

  await cart.destroy();
});

export const webhook = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.WEBHOOK_SECRET_KEY;

  const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

  if (event.type === "checkout.session.completed") {
    // Create order
    makePurchase(event.data.object);
  }

  res.status(200).json({ message: "Success" });
});
