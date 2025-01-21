import asyncHandler from "express-async-handler";
import { ApiError } from "../utils/apiError.js";
import { Course, Module, Content } from "../models/index.js";
import { deleteFile, uploadFile } from "../utils/fileManager.js";
import { Purchase } from "../models/purchases.js";

export const getContent = asyncHandler(async (req, res, next) => {
  const { user } = req.user;
  const { contentId } = req.params;

  const content = await Content.findByPk(contentId);
  if (!content) throw new ApiError("Content not found", 404);

  const module = await Module.findByPk(content.module_id);
  if (!module) throw new ApiError("Module not found", 404);

  const course = await Course.findByPk(module.course_id);
  if (!course) throw new ApiError("Course not found", 404);

  console.log([course.course_id]);

  const isPaid = await Purchase.findOne({
    where: {
      user_id: user.user_id,
      course_id: [course.course_id],
    },
  });

  if (!isPaid) {
    throw new ApiError("You must pay this course to watch the content", 403);
  }

  res.status(200).json(content);
});

export const createContent = asyncHandler(async (req, res, next) => {
  const { title, order } = req.body;
  const { moduleId } = req.params;
  const file = req.file;

  const module = await Module.findByPk(moduleId);
  if (!module) throw new ApiError("Module not found", 404);

  const results = await uploadFile(file, module, "content");

  const content = await Content.create({
    title,
    fileType: results.fileType,
    file: {
      key: results.uploadResult.Key,
      url: results.uploadResult.Location,
      bucket: results.uploadResult.Bucket,
    },
    order: +order,
    module_id: module.module_id,
    duration: results.duration,
  });

  res.status(201).json({ message: "File uploaded successfully", content });
});

export const updateContent = asyncHandler(async (req, res, next) => {
  const { title, order } = req.body;
  const { contentId } = req.params;
  const file = req.file;

  const contentDoc = await Content.findByPk(contentId);
  if (!contentDoc) throw new ApiError("Content not found", 404);

  const module = await Module.findByPk(contentDoc.module_id);

  await deleteFile(contentDoc.file.bucket, contentDoc.file.key);

  const results = await uploadFile(file, module, "content");

  const [numberOfUpdates, updatedContent] = await Content.update(
    {
      title,
      fileType: results.fileType,
      file: {
        url: results.uploadResult.Location,
        key: results.uploadResult.Key,
        bucket: results.uploadResult.Bucket,
      },
      order: +order,
      module_id: module.module_id,
      duration: results.duration,
    },
    {
      where: { content_id: contentId },
      returning: true,
    }
  );

  res
    .status(201)
    .json({ message: "File updated successfully", updatedContent });
});

export const deleteContent = asyncHandler(async (req, res, next) => {
  const { contentId } = req.params;

  const content = await Content.findByPk(contentId);
  if (!content) throw new ApiError("Content not found", 404);

  await deleteFile(content.file.bucket, content.file.key);

  await content.destroy();

  res.status(200).json({ message: "File deleted successfully" });
});
