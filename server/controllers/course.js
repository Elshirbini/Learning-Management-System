import asyncHandler from "express-async-handler";
import { Course, User } from "../models/index.js";
import { ApiError } from "../utils/apiError.js";
import { Op } from "sequelize";

export const getCourses = asyncHandler(async (req, res, next) => {
  const { page, pageSize } = req.query;
  const { category } = req.params;

  if (isNaN(page) || isNaN(pageSize) || page <= 0 || pageSize <= 0) {
    throw new ApiError("Invalid page or pageSize parameters", 400);
  }

  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  const courses = await Course.findAndCountAll({
    where: { category: category },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  if (!courses.rows) throw new ApiError("No courses found", 404);

  res.status(200).json(courses);
});

export const createCourse = asyncHandler(async (req, res, next) => {
  const { user } = req.user;
  const { title, description, category, language, price } = req.body;
  // const thumbnail = req.file.path

  const userData = await User.findByPk(user.user_id);

  const course = await Course.create({
    title,
    description,
    category,
    language,
    price,
    // thumbnail,
  });

  await course.setInstructor(userData);

  res.status(201).json({ course });
});

export const updateCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const { title, description, category, language, price } = req.body;

  const [numberOfUpdates, updatedCourses] = await Course.update(
    { title, description, category, language, price },
    { where: { course_id: courseId }, returning: true }
  );

  if (numberOfUpdates === 0) throw new ApiError("Course not found", 404);

  res.status("200").json({
    message: "Course updated successfully",
    course: updatedCourses[0],
  });
});

export const deleteCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  const course = await Course.findByPk(courseId);
  if (!course) throw new ApiError("Course not found", 404);

  await course.destroy();

  res.status(200).json({ message: "Course deleted successfully" });
});

export const searchCourse = asyncHandler(async (req, res, next) => {
  const { user } = req.user;
  const { searchQuery } = req.query;

  if (!user) throw new ApiError("User not found", 404);

  if (!searchQuery) throw new ApiError("Search query is required", 403);

  const courses = await Course.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.iLike]: `%${searchQuery}%` } },
        { description: { [Op.iLike]: `%${searchQuery}%` } },
      ],
    },
    order: [["createdAt", "DESC"]],
  });

  if (!courses || courses.length === 0) {
    throw new ApiError("Courses not found", 404);
  }

  res.status(200).json(courses);
});
