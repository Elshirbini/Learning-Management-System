import { ApiError } from "../utils/apiError.js";
import { Cart, CartItems, Course } from "../models/index.js";

export const getCart = async (req, res, next) => {
  const userId = req.userId;

  const cart = await Cart.findOne({ where: { user_id: userId } });
  if (!cart) throw new ApiError("Cart not found", 404);

  const cartItems = await CartItems.findAll({
    where: { cart_id: cart.cart_id },
  });

  if (!cartItems || cartItems.length === 0) {
    throw new ApiError("No Items in your cart", 404);
  }

  res.status(200).json({ cart, cartItems });
};

export const addToCart = async (req, res, next) => {
  const userId = req.userId;
  const { courseId, price } = req.body;

  const course = await Course.findByPk(courseId);

  if (!course || price !== course.price) {
    throw new ApiError("Product not found or invalid request", 404);
  }

  const cart = await Cart.findOne({ where: { user_id: userId } });

  if (cart) {
    const cartItem = await CartItems.findOne({
      where: { cart_id: cart.cart_id, course_id: courseId },
    });

    if (cartItem) {
      throw new ApiError("This course is already exists in your cart", 403);
    }
    const updatedCartItem = await CartItems.create({
      course_id: courseId,
      price,
      cart_id: cart.cart_id,
    });

    const totalCost = await calcTotalCost(cart.cart_id);

    cart.totalCost = totalCost;

    await cart.save();

    return res.status(200).json({
      message: "Course added to cart successfully",
      cart,
      updatedCartItem,
    });
  } else {
    const cart = await Cart.create({ user_id: userId });

    const cartItem = await CartItems.create({
      course_id: courseId,
      price,
      cart_id: cart.cart_id,
    });

    const totalCost = await calcTotalCost(cart.cart_id);

    cart.totalCost = totalCost;

    await cart.save();

    return res.status(200).json({
      message: "Course added to cart successfully",
      cart,
      cartItem,
    });
  }
};

export const removeFromCart = async (req, res, next) => {
  const userId = req.userId;
  const { itemId } = req.params;

  const cartItem = await CartItems.findOne({ where: { item_id: itemId } });
  if (!cartItem) throw new ApiError("Item not found", 404);

  const cart_id = cartItem.cart_id;

  const cart = await Cart.findOne({
    where: { cart_id: cart_id, user_id: user.user_id },
  });
  if (!cart) throw new ApiError("Cart not found", 404);

  await cartItem.destroy();

  const totalCost = await calcTotalCost(cart_id);
  cart.totalCost = totalCost;

  await cart.save();

  res
    .status(200)
    .json({ message: "Item removed from cart successfully", cart, cartItem });
};

const calcTotalCost = async (cartId) => {
  const prices = await CartItems.findAll({
    where: { cart_id: cartId },
    attributes: ["price"],
  });
  return prices.reduce((acc, item) => acc + item.price, 0);
};
