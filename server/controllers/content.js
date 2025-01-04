import asyncHandler from "express-async-handler";

export const createContent = asyncHandler(async (req, res, next) => {
  const file = req.file.path;

  console.log(file.includes(".pdf"))
});
