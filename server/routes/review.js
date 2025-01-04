import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import {
  deleteReview,
  getReviews,
  makeReview,
  updateReview,
} from "../controllers/review.js";

const router = express.Router();

router.get("/get-reviews/:courseId", verifyToken, getReviews);

router.post("/make-review/:courseId", verifyToken, makeReview);

router.put("/update-review/:reviewId", verifyToken, updateReview);

router.delete("/delete-review/:reviewId", verifyToken, deleteReview);

export const reviewRoutes = router;
