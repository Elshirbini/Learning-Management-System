import AWS from "aws-sdk";
import { configDotenv } from "dotenv";
configDotenv();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

export const S3 = new AWS.S3();
