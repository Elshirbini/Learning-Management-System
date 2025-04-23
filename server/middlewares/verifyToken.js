import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/index.js";
configDotenv();

export const verifyToken = async (req, res, next) => {
  let token;
  if (req.cookies["accessToken"]) {
    token = req.cookies["accessToken"];
  }

  if (!token) return next(new ApiError("You are not authenticated.", 400));

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
    if (err) return next(new ApiError("Token is not valid", 401));
    req.userId = user.id;
    req.userRole = user.role;
    const userDoc = await User.findByPk(user.id);
    if (!userDoc) throw new ApiError("User not found", 404);
    next();
  });
};
