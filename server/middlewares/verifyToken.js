import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/index.js";
import asyncHandler from "express-async-handler";
configDotenv();

export const verifyToken = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.cookie) {
    token = req.headers.cookie.split("jwt=")[1];
  }

  if (!token) return next(new ApiError("You are not authenticated.", 400));

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) return next(new ApiError("Token is not valid", 401));
    req.user = user;
    const userDoc = await User.findByPk(user.user.user_id);
    if (!userDoc) throw new ApiError("User not found", 404);
    next();
  });
});
