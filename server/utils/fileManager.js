import AWS from "aws-sdk";
import { configDotenv } from "dotenv";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { ApiError } from "./apiError.js";
import { promises as fsPromises } from "fs";
import ffmpeg from "fluent-ffmpeg";
configDotenv();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
  logger: console,
  httpOptions: {
    timeout: 60000,
    http2: true,
  },
  maxRetries: 3,
});

const S3 = new AWS.S3();

const __dirname = dirname(fileURLToPath(import.meta.url));

const getVideoDuration = async (fileBuffer, fileName) => {
  const tempDir = path.join(__dirname, "temp");

  // تأكد إن الفولدر موجود
  await fsPromises.mkdir(tempDir, { recursive: true });

  const tempFilePath = path.join(tempDir, fileName);

  // احفظ الفايل مؤقتًا
  await fsPromises.writeFile(tempFilePath, fileBuffer);

  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(tempFilePath, async (err, metadata) => {
      // احذف الفايل المؤقت بعد التحليل
      await fsPromises.unlink(tempFilePath).catch(() => {}); // عشان نتفادى crash لو الملف مش موجود

      if (err) {
        console.error(`Error in ffprobe: ${err.message}`);
        return reject(err);
      }

      resolve(metadata.format.duration);
    });
  });
};

export const uploadFile = async (file, module, type) => {
  let fileName;
  let fileType;
  let duration;
  if (!file) throw new ApiError("File is required", 400);

  if (file.size > 524288000) {
    throw new ApiError("The max file size allowed is 500MB", 400);
  }

  if (type === "content") {
    const allowedMimetype = ["application/pdf", "video/mp4"];
    if (!allowedMimetype.includes(file.mimetype)) {
      throw new ApiError("File extension is not allowed", 400);
    }

    if (file.mimetype === "application/pdf") {
      fileType = "pdf";
    } else if (file.mimetype === "video/mp4") {
      fileType = "video";
      duration = await getVideoDuration(file.buffer, file.originalname);
      duration =
        duration >= 60
          ? `${Math.ceil(duration / 60)}m`
          : `${Math.ceil(duration)}s`;
    }

    fileName = `Content/${module.course_id}/${module.module_id}/${file.originalname}`;
  } else {
    const allowedMimetype = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!allowedMimetype.includes(file.mimetype)) {
      throw new ApiError("File extension is not allowed", 400);
    }
    fileName = `Thumbnails/${file.originalname}`;
  }

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const options = {
    PartSize: 10 * 1024 * 1024,
    queueSize: 5,
  };

  const uploadResult = await S3.upload(params, options).promise();

  if (!uploadResult.Location) {
    throw new ApiError("File upload failed", 500);
  }

  const results = { uploadResult, fileType, duration };

  return results;
};

export const deleteFile = async (bucket, key) => {
  const params = { Bucket: bucket, Key: key };

  S3.deleteObject(params, (err, data) => {
    if (err) throw new ApiError("Deleting file failed", 500);
    console.log("File deleted successfully from S3:", key);
  });
};
