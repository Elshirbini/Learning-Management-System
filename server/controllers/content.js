import asyncHandler from "express-async-handler";
import { ApiError } from "../utils/apiError.js";
import { Module } from "../models/module.js";
import { S3 } from "../config/s3.js";
import { Content } from "../models/content.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

const __dirname = dirname(fileURLToPath(import.meta.url));

const getVideoDuration = (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    const tempDir = path.join(__dirname, "temp");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, fileName);

    fs.writeFileSync(tempFilePath, fileBuffer);

    ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
      fs.unlinkSync(tempFilePath);

      if (err) {
        console.error(`Error in ffprobe: ${err.message}`);
        return reject(err);
      }

      resolve(metadata.format.duration);
    });
  });
};

export const createContent = asyncHandler(async (req, res, next) => {
  const { title, order } = req.body;
  const { moduleId } = req.params;
  const file = req.file;

  if (!file) throw new ApiError("File is required", 400);

  let fileType;
  let duration;
  if (file.mimetype === "application/pdf") {
    fileType = "pdf";
  } else if (file.mimetype === "video/mp4") {
    fileType = "video";
    duration = await getVideoDuration(file.buffer, file.originalname);
    if (duration >= 60) {
      duration = `${Math.ceil(duration)}m`;
    } else if (duration < 60) {
      duration = `${Math.ceil(duration)}s`;
    } else {
      duration = null;
    }
  }

  const allowedMimetype = ["application/pdf", "video/mp4"];

  if (!allowedMimetype.includes(file.mimetype)) {
    throw new ApiError("File extension is not allowed", 400);
  }

  if (file.size > 524288000) {
    throw new ApiError("The max size you can upload is 500MB");
  }

  const module = await Module.findByPk(moduleId);
  if (!module) throw new ApiError("Module not found", 404);

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
    duration,
  });

  res.status(201).json({ message: "File is uploaded successfully", content });
});
