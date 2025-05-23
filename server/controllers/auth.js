import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { configDotenv } from "dotenv";
import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/index.js";
import { Op } from "sequelize";
import redisClient from "../config/redis.js";
import { sendToEmail } from "../utils/sendToEmails.js";

configDotenv();
const maxAge = 1 * 24 * 60 * 60 * 1000;

const cookieOptions = {
  maxAge,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

export const getUserInfo = async (req, res, next) => {
  const userId = req.userId;
  const user = await User.findByPk(userId);

  res.status(200).json({ user });
};

export const oAuthCallback = async (req, res, next) => {
  const token = req.user.token;

  res.cookie("accessToken", token, cookieOptions);

  res.status(200).redirect("/");
};

export const signup = async (req, res, next) => {
  const { email, name, password, confirmPassword } = req.body;
  const errors = validationResult(req);

  if (password !== confirmPassword) {
    return next(new ApiError("Password and confirm password must be equal"));
  }

  if (!errors.isEmpty()) throw new ApiError(errors.array()[0].msg, 400);

  const hashedPassword = await bcrypt.hash(password, 12);

  const code = crypto.randomBytes(3).toString("hex");

  const userData = { email, name, hashedPassword };

  await redisClient.setEx(code, 600, JSON.stringify({ ...userData }));

  await sendToEmail(
    email,
    "Verify your email",
    `Paste Your Verification code ${code} \n\nThis Verification code will be valid for 10 min`
  );

  res.status(200).json({ message: "Verifying email" });
};

export const verifyEmail = async (req, res, next) => {
  const { code } = req.body;

  const userData = await redisClient.get(code);
  if (!userData) {
    throw new ApiError("Invalid or expired verification code", 400);
  }

  const { email, name, hashedPassword } = JSON.parse(userData);

  const user = await User.create({ email, name, password: hashedPassword });

  await redisClient.del(code);

  const token = new Promise((resolve, reject) => {
    jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: maxAge,
      },
      (err, token) => {
        if (err) return reject(new ApiError("Error in signing token", 501));
        resolve(token);
      }
    );
  });

  res.cookie("accessToken", token, cookieOptions);

  await sendToEmail(
    email,
    "Welcome for you in my E-Learning App",
    " Your account Created Successfully"
  );

  res.status(201).json({ message: "Account created successfully!", user });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email: email } });

  if (!user) throw new ApiError("User not found", 404);

  if (!user.password && user.googleId) {
    return res.redirect("http://localhost:8080/api/auth/google");
  }
  const isPassEq = await bcrypt.compare(password, user.password);

  if (!isPassEq) throw new ApiError("Password Wrong", 401);

  const token = await new Promise((resolve, reject) => {
    jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: maxAge,
      },
      (err, token) => {
        if (err) return reject(new ApiError("Error in signing token", 501));
        resolve(token);
      }
    );
  });

  res.cookie("accessToken", token, cookieOptions);

  res.status(200).json({ user });
};

export const logout = async (req, res, next) => {
  res.clearCookie("accessToken");

  res.status(200).json({ message: "Logout successfully" });
};

export const sendTokenToEmail = async (req, res, next) => {
  const { email } = req.body;

  const code = crypto.randomBytes(3).toString("hex");
  const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

  const [numberOfUpdates, updatedUser] = await User.update(
    {
      codeValidation: hashedCode,
      codeValidationExpire: new Date(Date.now() + 10 * 60 * 1000),
    },
    {
      where: { email: email },
      returning: true,
    }
  );

  if (!updatedUser) throw new ApiError("This email has no account", 403);

  await sendToEmail(
    email,
    "Reset Your Password",
    `Paste Your Verification code ${code} \n\nThis Verification code will be valid for 10 min`
  );

  res.status(200).json({
    message: "Code sent successfully",
    userId: updatedUser[0].user_id,
  });
};

export const validateCode = async (req, res, next) => {
  const { code } = req.body;
  const { userId } = req.params;

  const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

  const user = await User.findOne({
    where: {
      user_id: userId,
      codeValidation: hashedCode,
      codeValidationExpire: { [Op.gt]: Date.now() },
    },
  });

  if (!user) {
    throw new ApiError("This verification code not valid or expired.", 401);
  }

  res.status(200).json({ user });
};

export const resetPassword = async (req, res, next) => {
  const { userId } = req.params;
  const { newPassword, confirmPassword } = req.body;
  const errors = validationResult(req);

  if (newPassword !== confirmPassword) {
    throw new ApiError("The two passwords must be equal", 403);
  }

  if (!errors.isEmpty()) {
    throw new ApiError(errors.array()[0].msg, 400);
  }

  const userDoc = await User.findByPk(userId);

  const isSet = await bcrypt.compare(newPassword, userDoc.user_id);
  if (isSet) {
    throw new ApiError("This password has already exists", 403);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const [numberOfUpdates, updatedUser] = await User.update(
    {
      password: hashedPassword,
      codeValidation: null,
      codeValidationExpire: null,
    },
    {
      where: { user_id: userId },
      returning: true,
    }
  );

  res.clearCookie("accessToken");

  res.status(200).json({
    message: "Your password change successfully",
    userId: updatedUser[0],
  });
};

export const editProfile = async (req, res, next) => {
  const userId = req.userId;
  const { name, phone } = req.body;

  const [numberOfUpdates, updatedUser] = await User.update(
    {
      name,
      phone,
    },
    {
      where: { user_id: userId },
      returning: true,
    }
  );

  if (!updatedUser) throw new ApiError("User not found", 401);

  res.status(200).json({
    message: "Profile edited successfully",
    user: updatedUser[0],
  });
};
