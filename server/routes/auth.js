import express from "express";
import {
  editProfile,
  getUserInfo,
  login,
  logout,
  resetPassword,
  sendTokenToEmail,
  signup,
  validateCode,
  verifyEmail,
} from "../controllers/auth.js";
import { body } from "express-validator";
import { User } from "../models/user.js";
import { oAuthenticated, oCallback } from "../middlewares/passportOAuth.js";
import { oAuthCallback } from "../controllers/auth.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/google", oAuthenticated);
router.get("/google/callback", oCallback, oAuthCallback);

router.get("/get-user-info", verifyToken, getUserInfo);

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please write a valid email")
      .custom((value, { req }) => {
        return User.findOne({ where: { email: value } }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email has already exist");
          }
        });
      })
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8, max: 16 })
      .withMessage("Password should be contains from 8 to 16 chars")
      .matches(/[A-Z]/)
      .withMessage("Password must be contain chars from A to Z")
      .matches(/[a-z]/)
      .withMessage("Password must be contain chars from a to z")
      .matches(/[0-9]/)
      .withMessage("Password must be contains numbers")
      .matches(/[!@#$%^&*(){}<>?~]/)
      .withMessage("Password must be special chars"),
  ],
  signup
);

router.post("/verify-email", verifyEmail);

router.post("/login", login);

router.patch("/logout", logout);

router.put("/edit-profile", verifyToken, editProfile);

router.post("/send-code-to-email", sendTokenToEmail);

router.post("/validate-code/:userId", validateCode);

router.put(
  "/reset-password/:userId",
  [
    body("newPassword")
      .isLength({ min: 8, max: 16 })
      .withMessage("Password should be contains from 8 to 16 chars")
      .matches(/[A-Z]/)
      .withMessage("Password must be contain chars from A to Z")
      .matches(/[a-z]/)
      .withMessage("Password must be contain chars from a to z")
      .matches(/[0-9]/)
      .withMessage("Password must be contains numbers")
      .matches(/[!@#$%^&*(){}<>?~]/)
      .withMessage("Password must be special chars"),
  ],
  resetPassword
);

export const authRoutes = router;
