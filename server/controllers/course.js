import asyncHandler from "express-async-handler";
import { Course, User, Module, Content } from "../models/index.js";
import { ApiError } from "../utils/apiError.js";
import { Op } from "sequelize";
import { deleteFile, uploadFile } from "../utils/fileManager.js";

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

export const getCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  const course = await Course.findByPk(courseId);
  if (!course) throw new ApiError("Course not found", 404);

  const modules = await Module.findAll({
    where: { course_id: courseId },
    order: [["order", "ASC"]],
  });
  if (!modules || modules.length === 0) {
    throw new ApiError("Modules not found", 404);
  }

  const modulesWithContent = await Promise.all(
    modules.map(async (module) => {
      const content = await Content.findAll({
        where: { module_id: module.module_id },
        attributes: ["content_id", "title", "fileType", "duration"],
      });

      return {
        moduleId: module.module_id,
        moduleTitle: module.title,
        order: module.order,
        content: content.map((item) => ({
          contentId: item.content_id,
          contentTitle: item.title,
          contentFileType: item.fileType,
          contentDuration: item.duration,
        })),
      };
    })
  );

  res.status(200).json({ course, modulesWithContent });
});

export const createCourse = asyncHandler(async (req, res, next) => {
  const { user } = req.user;
  const { title, description, category, language, price } = req.body;
  const thumbnail = req.file;

  const results = await uploadFile(thumbnail, null, "thumbnail");

  const userData = await User.findByPk(user.user_id);

  const course = await Course.create({
    title,
    description,
    category,
    language,
    price,
    thumbnail: {
      key: results.uploadResult.Key,
      url: results.uploadResult.Location,
      bucket: results.uploadResult.Bucket,
    },
  });

  await course.setInstructor(userData);

  res.status(201).json({ course });
});

export const updateCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const { title, description, category, language, price } = req.body;
  const thumbnail = req.file;

  const course = await Course.findByPk(courseId);
  if (!course) throw new ApiError("Course not found", 404);

  await deleteFile(course.thumbnail.bucket, course.thumbnail.key);

  const results = await uploadFile(thumbnail, null, "thumbnail");

  const [numberOfUpdates, updatedCourses] = await Course.update(
    {
      title,
      description,
      category,
      language,
      price,
      thumbnail: {
        key: results.uploadResult.Key,
        url: results.uploadResult.Location,
        bucket: results.uploadResult.Bucket,
      },
    },
    { where: { course_id: courseId }, returning: true }
  );

  if (numberOfUpdates === 0) throw new ApiError("Course not found", 404);

  res.status(200).json({
    message: "Course updated successfully",
    course: updatedCourses[0],
  });
});

export const deleteCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  const course = await Course.findByPk(courseId);
  if (!course) throw new ApiError("Course not found", 404);

  if(course.thumbnail){
    await deleteFile(course.thumbnail.bucket, course.thumbnail.key);
  }

  await course.destroy();

  res.status(200).json({ message: "Course deleted successfully" });
});

export const searchCourse = asyncHandler(async (req, res, next) => {
  const { searchQuery } = req.query;

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
