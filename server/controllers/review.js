import asyncHandler from "express-async-handler";
import { Course, Review } from "../models/index.js";
import { ApiError } from "../utils/apiError.js";

export const getReviews = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  const course = await Course.findByPk(courseId);
  if (!course) throw new ApiError("Course not found", 404);

  const reviews = await Review.findAll({
    where: { course_id: courseId },
    order: [["createdAt", "DESC"]],
  });

  if (!reviews || reviews.length === 0) {
    throw new ApiError("No reviews founds", 404);
  }

  res.status(200).json(reviews);
});

export const makeReview = asyncHandler(async (req, res, next) => {
  const userId = req.userId;
  const { courseId } = req.params;
  const { rating, comment } = req.body;

  const course = await Course.findByPk(courseId);
  if (!course) throw new ApiError("Course not found", 404);

  const review = await Review.create({
    rating,
    comment,
    user_id: userId,
    course_id: course.course_id,
  });

  res.status(201).json({ review });
});

export const updateReview = asyncHandler(async (req, res, next) => {
  const userId = req.userId;
  const { reviewId } = req.params;
  const { rating, comment } = req.body;

  const [numberOfUpdates, updatedReviews] = await Review.update(
    {
      rating,
      comment,
    },
    { where: { review_id: reviewId, user_id: userId }, returning: true }
  );

  if (!updatedReviews || updatedReviews.length === 0) {
    throw new ApiError("No reviews found", 404);
  }

  res.status(200).json({ review: updatedReviews[0] });
});

export const deleteReview = asyncHandler(async (req, res, next) => {
  const userId = req.userId;
  const { reviewId } = req.params;

  const review = await Review.findOne({
    where: { user_id: userId, review_id: reviewId },
  });

  if (!review) throw new ApiError("Review not found", 404);

  await review.destroy();

  res.status(200).json({ message: "Review deleted successfully" });
});
