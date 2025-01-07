import asyncHandler from "express-async-handler";
import { ApiError } from "../utils/apiError.js";
import { Module } from "../models/module.js";
import { Content } from "../models/content.js";
import { uploadFile } from "../utils/uploadFile.js";

export const createContent = asyncHandler(async (req, res, next) => {
  const { title, order } = req.body;
  const { moduleId } = req.params;
  const file = req.file;

  const module = await Module.findByPk(moduleId);
  if (!module) throw new ApiError("Module not found", 404);

  const results = await uploadFile(file, module);

  const content = await Content.create({
    title,
    fileType: results.fileType,
    fileUrl: results.uploadResult.Location,
    order: +order,
    module_id: module.module_id,
    duration: results.duration,
  });

  res.status(201).json({ message: "File uploaded successfully", content });
});
