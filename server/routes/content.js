import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { restrictTo } from "../middlewares/restricting.js";
import {
  createContent,
  deleteContent,
  getContent,
  updateContent,
} from "../controllers/content.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.get("/get-content/:contentId", verifyToken, getContent);

router.post(
  "/create-content/:moduleId",
  verifyToken,
  restrictTo("admin", "instructor"),
  upload.single("file"),
  createContent
);

router.put(
  "/update-content/:contentId",
  verifyToken,
  restrictTo("admin", "instructor"),
  upload.single("file"),
  updateContent
);

router.delete(
  "/delete-content/:contentId",
  verifyToken,
  restrictTo("admin", "instructor"),
  deleteContent
);

export const contentRoutes = router;
