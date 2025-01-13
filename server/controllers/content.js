import asyncHandler from "express-async-handler";
import { ApiError } from "../utils/apiError.js";
import { Module } from "../models/index.js";
import { Content } from "../models/index.js";
import { deleteFile, uploadFile } from "../utils/fileManager.js";

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

  const results = await uploadFile(file, module);

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
