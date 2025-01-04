import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { restrictTo } from "../middlewares/restricting.js";
import {
  createCourse,
  deleteCourse,
  getCourses,
  searchCourse,
  updateCourse,
} from "../controllers/course.js";

const router = express.Router();

router.get("/search-courses" , verifyToken , searchCourse )

router.get("/get-courses/:category", verifyToken, getCourses);

router.post(
  "/create-course",
  verifyToken,
  restrictTo("admin", "instructor"),
  createCourse
);
router.put(
  "/update-course/:courseId",
  verifyToken,
  restrictTo("admin", "instructor"),
  updateCourse
);

router.delete(
  "/delete-course/:courseId",
  verifyToken,
  restrictTo("admin", "instructor"),
  deleteCourse
);

export const courseRoutes = router;
