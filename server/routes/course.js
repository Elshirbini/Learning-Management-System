import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { restrictTo } from "../middlewares/restricting.js";
import {
  createCourse,
  deleteCourse,
  getCourse,
  getCourses,
  searchCourse,
  updateCourse,
} from "../controllers/course.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.get("/search-courses", verifyToken, searchCourse);

router.get("/get-courses/:category", verifyToken, getCourses);

router.get("/get-course/:courseId", verifyToken, getCourse);

router.post(
  "/create-course",
  verifyToken,
  restrictTo("admin", "instructor"),
  upload.single("file"),
  createCourse
);
router.put(
  "/update-course/:courseId",
  verifyToken,
  restrictTo("admin", "instructor"),
  upload.single("file"),
  updateCourse
);

router.delete(
  "/delete-course/:courseId",
  verifyToken,
  restrictTo("admin", "instructor"),
  deleteCourse
);

export const courseRoutes = router;
