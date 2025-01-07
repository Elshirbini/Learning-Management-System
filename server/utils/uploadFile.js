import AWS from "aws-sdk";
import { configDotenv } from "dotenv";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import asyncHandler from "express-async-handler";
import { ApiError } from "../utils/apiError.js";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
configDotenv();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

const S3 = new AWS.S3();

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

export const uploadFile = asyncHandler(async (file, module) => {
  if (!file) throw new ApiError("File is required", 400);

  let fileType;
  let duration;
  if (file.mimetype === "application/pdf") {
    fileType = "pdf";
  } else if (file.mimetype === "video/mp4") {
    fileType = "video";
    duration = await getVideoDuration(file.buffer, file.originalname);
    if (duration >= 60) {
      duration = `${Math.ceil(duration / 60)}m`;
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
    throw new ApiError("The max file size allowed is 500MB", 400);
  }

  const fileName = `Content/${module.course_id}/${module.module_id}/${file.originalname}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const uploadResult = await S3.upload(params).promise();

  if (!uploadResult.Location) {
    throw new ApiError("File upload failed", 500);
  }

  const results = { uploadResult, fileType, duration };

  return results;
});
