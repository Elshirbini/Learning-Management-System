import asyncHandler from "express-async-handler";
import { ApiError } from "../utils/apiError.js";
import { Module } from "../models/module.js";
import { S3 } from "../config/s3.js";
import { Content } from "../models/content.js";

export const createContent = asyncHandler(async (req, res, next) => {
  const { title, order } = req.body;
  const { moduleId } = req.params;
  const file = req.file;

  const module = await Module.findByPk(moduleId);
  if (!module) throw new ApiError("Module not found", 404);

  if (!file) throw new ApiError("File is required", 400);

  if (file.size > 524288000) {
    throw new ApiError("The max size you can upload is 500MB");
  }

  const fileName = `Content/${module.course_id}/${module.module_id}/${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const uploadResult = await S3.upload(params).promise();

  const content = await Content.create({
    title,
    fileType: file.mimetype === "application/pdf" ? "pdf" : "video",
    fileUrl: uploadResult.Location,
    order: +order,
    module_id: module.module_id,
  });

  res.status(201).json({ message: "File is uploaded successfully", content });
});
