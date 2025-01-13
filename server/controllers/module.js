import asyncHandler from "express-async-handler";
import { Content, Course, Module } from "../models/index.js";
import { ApiError } from "../utils/apiError.js";
import { deleteFile } from "../utils/fileManager.js";

export const getModules = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;

  const modules = await Module.findAll({
    where: { course_id: courseId },
    order: [["order", "ASC"]],
  });

  if (!modules || modules.length === 0) {
    throw new ApiError("Modules not found", 404);
  }

  res.status(200).json(modules);
});

export const createModule = asyncHandler(async (req, res, next) => {
  const { title, order } = req.body;
  const { courseId } = req.params;

  const course = await Course.findByPk(courseId);
  if (!course) throw new ApiError("Course not found", 404);

  const module = await Module.create({ title, order, course_id: courseId });

  res.status(201).json({
    message: "Module created successfully",
    module,
  });
});

export const updateModule = asyncHandler(async (req, res, next) => {
  const { moduleId } = req.params;
  const { title, order } = req.body;

  const [numberOfUpdates, updateModule] = await Module.update(
    { title, order },
    { where: { module_id: moduleId }, returning: true }
  );

  if (!updateModule || updateModule.length === 0) {
    throw new ApiError("Module not found");
  }

  res.status(200).json({
    message: "Module updated successfully",
    module: updateModule[0],
  });
});

export const deleteModule = asyncHandler(async (req, res, next) => {
  const { moduleId } = req.params;

  const module = await Module.findByPk(moduleId);
  if (!module) throw new ApiError("Module not found", 404);

  const files = await Content.findAll({
    where: { module_id: moduleId },
    attributes: ["file"],
  });

  const errors = [];
  await Promise.all(
    files.map(async (doc) => {
      try {
        await deleteFile(doc.file.bucket, doc.file.key);
      } catch (error) {
        errors.push(`Failed to delete file: ${doc.file.key}`);
      }
    })
  );

  if (errors.length > 0) {
    throw new ApiError(errors.join(", "), 500);
  }

  await module.destroy();

  res.status(200).json({ message: "Module deleted successfully" });
});
