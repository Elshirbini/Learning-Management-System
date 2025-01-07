import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { restrictTo } from "../middlewares/restricting.js";
import { createContent } from "../controllers/content.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.post(
  "/create-content/:moduleId",
  verifyToken,
  restrictTo("admin", "instructor"),
  upload.single("file"),
  createContent
);



export const contentRoutes = router;
